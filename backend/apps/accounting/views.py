from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.authentication.models import OrganizationMembership

from .models import (
    Account,
    Daybook,
    DaybookTransaction,
    InterestCalculation,
    InterestCalculationTemp,
    PartyBankDetails,
    PartyLedger,
    PartyLedgerOpening,
)
from .serializers import (
    AccountCreateSerializer,
    AccountDetailSerializer,
    AccountListSerializer,
    AccountTreeSerializer,
    DaybookSerializer,
    DaybookTransactionCreateSerializer,
    DaybookTransactionSerializer,
    InterestCalculationRequestSerializer,
    InterestCalculationSerializer,
    InterestCalculationTempSerializer,
    InterestPostingRequestSerializer,
    PartyBankDetailsSerializer,
    PartyLedgerCreateSerializer,
    PartyLedgerOpeningSerializer,
    PartyLedgerSerializer,
)
from .services import InterestCalculationService


class OrganizationMixin:
    """Mixin for multi-tenant filtering based on organization."""

    def get_organization(self):
        """Get the current user's active organization."""
        user = self.request.user
        membership = OrganizationMembership.objects.filter(
            user=user,
            status=OrganizationMembership.Status.ACTIVE,
            is_default=True,
        ).select_related("organization").first()

        if not membership:
            membership = OrganizationMembership.objects.filter(
                user=user,
                status=OrganizationMembership.Status.ACTIVE,
            ).select_related("organization").first()

        return membership.organization if membership else None

    def get_queryset(self):
        organization = self.get_organization()
        if not organization:
            return self.queryset.none()
        return self.queryset.filter(organization=organization)

    def perform_create(self, serializer):
        organization = self.get_organization()
        serializer.save(organization=organization)


class AccountViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Account model."""

    queryset = Account.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        is_party = self.request.query_params.get("is_party")
        if is_party and is_party.lower() == "true":
            queryset = queryset.filter(party_type__isnull=False)
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return AccountListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return AccountCreateSerializer
        if self.action == "tree":
            return AccountTreeSerializer
        return AccountDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    # Mapping of party_type to parent account code and balance nature
    PARTY_TYPE_CONFIG = {
        "KISAN": {"parent_code": "9", "balance_nature": "DEBIT"},  # SUNDRY DEBTERS
        "AARTI": {"parent_code": "9", "balance_nature": "DEBIT"},
        "KISAN_D": {"parent_code": "9", "balance_nature": "DEBIT"},
        "MANDI": {"parent_code": "9", "balance_nature": "DEBIT"},
        "OTHERS": {"parent_code": "9", "balance_nature": "DEBIT"},
        "GUARANTOR": {"parent_code": "9", "balance_nature": "DEBIT"},
        "STAFF": {"parent_code": "21", "balance_nature": "CREDIT"},  # STAFF
        "LOADING_CONTRACTOR": {"parent_code": "20", "balance_nature": "CREDIT"},  # SUNDRY CREDITERS
        "CHATAI_CONTRACTOR": {"parent_code": "20", "balance_nature": "CREDIT"},
        "FINANCER": {"parent_code": "13", "balance_nature": "CREDIT"},  # UNSECURED LOAN
    }

    def perform_create(self, serializer):
        organization = self.get_organization()
        party_type = serializer.validated_data.get("party_type")

        extra_kwargs = {"organization": organization}

        if party_type and party_type in self.PARTY_TYPE_CONFIG:
            config = self.PARTY_TYPE_CONFIG[party_type]
            # Auto-assign parent if not explicitly provided
            if not serializer.validated_data.get("parent"):
                parent = Account.objects.filter(
                    organization=organization,
                    code=config["parent_code"],
                ).first()
                if parent:
                    extra_kwargs["parent"] = parent
            # Auto-assign balance_nature based on party type
            extra_kwargs["balance_nature"] = config["balance_nature"]
            # Party accounts are always ACCOUNT type (not GROUP)
            extra_kwargs["account_type"] = "ACCOUNT"

        serializer.save(**extra_kwargs)

    @action(detail=False, methods=["get"])
    def tree(self, request):
        """Get hierarchical tree of accounts."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        root_id = request.query_params.get("root_id")
        tree = Account.objects.get_tree(organization.id, root_id)
        serializer = AccountTreeSerializer(tree, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def ancestors(self, request, pk=None):
        """Get all ancestors of an account."""
        ancestors = Account.objects.get_ancestors(pk)
        serializer = AccountListSerializer(ancestors, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def descendants(self, request, pk=None):
        """Get all descendants of an account."""
        descendants = Account.objects.get_descendants(pk)
        serializer = AccountListSerializer(descendants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def ledger(self, request, pk=None):
        """Get ledger entries for an account."""
        account = self.get_object()
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")

        entries = PartyLedger.objects.filter(account=account)
        if from_date:
            entries = entries.filter(date__gte=from_date)
        if to_date:
            entries = entries.filter(date__lte=to_date)

        entries = entries.order_by("date", "serial_number")
        serializer = PartyLedgerSerializer(entries, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def recalculate_balance(self, request, pk=None):
        """Recalculate balance for an account."""
        account = self.get_object()
        account.recalculate_balance()
        serializer = AccountDetailSerializer(account)
        return Response(serializer.data)


class PartyLedgerViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for PartyLedger model."""

    queryset = PartyLedger.objects.select_related("account")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return PartyLedgerCreateSerializer
        return PartyLedgerSerializer

    def perform_create(self, serializer):
        organization = self.get_organization()
        entry = serializer.save(organization=organization)
        # Recalculate account balance after creating entry
        entry.account.recalculate_balance()

    def perform_update(self, serializer):
        entry = serializer.save()
        entry.account.recalculate_balance()

    def perform_destroy(self, instance):
        account = instance.account
        instance.delete()
        account.recalculate_balance()


class PartyLedgerOpeningViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for PartyLedgerOpening model."""

    queryset = PartyLedgerOpening.objects.select_related("account")
    permission_classes = [IsAuthenticated]
    serializer_class = PartyLedgerOpeningSerializer


class DaybookViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Daybook model."""

    queryset = Daybook.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = DaybookSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        date = self.request.query_params.get("date")
        if date:
            queryset = queryset.filter(date=date)
        return queryset

    @action(detail=True, methods=["post"])
    def recalculate(self, request, pk=None):
        """Recalculate daybook totals."""
        daybook = self.get_object()
        daybook.recalculate_totals()
        serializer = self.get_serializer(daybook)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        """Close daybook for the day."""
        daybook = self.get_object()
        daybook.is_closed = True
        daybook.save()
        serializer = self.get_serializer(daybook)
        return Response(serializer.data)


class DaybookTransactionViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for DaybookTransaction model."""

    queryset = DaybookTransaction.objects.select_related(
        "debit_account", "credit_account", "daybook"
    )
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return DaybookTransactionCreateSerializer
        return DaybookTransactionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        date = self.request.query_params.get("date")
        voucher_type = self.request.query_params.get("voucher_type")
        if date:
            queryset = queryset.filter(date=date)
        if voucher_type:
            queryset = queryset.filter(voucher_type=voucher_type)
        return queryset

    def perform_create(self, serializer):
        organization = self.get_organization()
        transaction = serializer.save(organization=organization)

        # Link to or create daybook
        daybook, _ = Daybook.objects.get_or_create(
            organization=organization,
            date=transaction.date,
        )
        transaction.daybook = daybook
        transaction.save()

        # Recalculate daybook totals
        daybook.recalculate_totals()


class InterestCalculationViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for InterestCalculation model."""

    queryset = InterestCalculation.objects.select_related("account")
    permission_classes = [IsAuthenticated]
    serializer_class = InterestCalculationSerializer
    http_method_names = ["get", "post", "head", "options"]

    @action(detail=False, methods=["post"])
    def calculate(self, request):
        """Calculate interest for accounts."""
        serializer = InterestCalculationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = InterestCalculationService(organization)
        calculations = service.calculate_interest(
            from_date=serializer.validated_data["from_date"],
            to_date=serializer.validated_data["to_date"],
            account_ids=serializer.validated_data.get("account_ids"),
            days_in_year=serializer.validated_data.get("days_in_year", 365),
        )

        result_serializer = InterestCalculationSerializer(calculations, many=True)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def post(self, request):
        """Post calculated interest to ledger."""
        serializer = InterestPostingRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = InterestCalculationService(organization)
        entries = service.post_interest(
            calculation_ids=serializer.validated_data["calculation_ids"],
            posting_date=serializer.validated_data["posting_date"],
            narration=serializer.validated_data.get("narration", "Interest charged"),
        )

        result_serializer = PartyLedgerSerializer(entries, many=True)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def pending(self, request):
        """Get pending (unposted) interest calculations."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        account_id = request.query_params.get("account_id")
        service = InterestCalculationService(organization)
        pending = service.get_pending_calculations(account_id)

        serializer = InterestCalculationSerializer(pending, many=True)
        return Response(serializer.data)


class InterestCalculationTempViewSet(OrganizationMixin, viewsets.ReadOnlyModelViewSet):
    """ViewSet for InterestCalculationTemp model (read-only)."""

    queryset = InterestCalculationTemp.objects.select_related("account", "calculation")
    permission_classes = [IsAuthenticated]
    serializer_class = InterestCalculationTempSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        calculation_id = self.request.query_params.get("calculation_id")
        if calculation_id:
            queryset = queryset.filter(calculation_id=calculation_id)
        return queryset


class PartyBankDetailsViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for PartyBankDetails model."""

    queryset = PartyBankDetails.objects.select_related("account")
    permission_classes = [IsAuthenticated]
    serializer_class = PartyBankDetailsSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        account_id = self.request.query_params.get("account_id")
        if account_id:
            queryset = queryset.filter(account_id=account_id)
        return queryset
