from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounting.views import OrganizationMixin
from apps.inventory.models import Amad

from .models import Advance, AdvanceStatus, LoanAgainstGoods, LoanStatus
from .serializers import (
    AdvanceCreateSerializer,
    AdvanceDetailSerializer,
    AdvanceListSerializer,
    CollateralAmadSerializer,
    InterestCalculationItemSerializer,
    LoanCreateSerializer,
    LoanDetailSerializer,
    LoanLedgerEntrySerializer,
    LoanListSerializer,
    LoanStatsSerializer,
    PartyLoanLedgerSerializer,
)
from .services import LoanService


class AdvanceViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Advance (Pesgi) model."""

    queryset = Advance.objects.select_related("party")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return AdvanceListSerializer
        if self.action == "create":
            return AdvanceCreateSerializer
        return AdvanceDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        advance_status = self.request.query_params.get("status")
        party_id = self.request.query_params.get("party_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if advance_status:
            queryset = queryset.filter(status=advance_status)
        if party_id:
            queryset = queryset.filter(party_id=party_id)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset

    def create(self, request, *args, **kwargs):
        """Create a new advance."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AdvanceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = LoanService(organization)
        try:
            advance = service.create_advance(serializer.validated_data, user=request.user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AdvanceDetailSerializer(advance).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel an advance."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("reason", "")
        if not reason:
            return Response(
                {"error": "Cancellation reason is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = LoanService(organization)
        try:
            advance = service.cancel_advance(pk, reason, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Advance.DoesNotExist:
            return Response(
                {"error": "Advance not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(AdvanceDetailSerializer(advance).data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get loan statistics."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = LoanService(organization)
        stats_data = service.get_loan_stats()

        serializer = LoanStatsSerializer(stats_data)
        return Response(serializer.data)


class LoanViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for LoanAgainstGoods (Karz) model."""

    queryset = LoanAgainstGoods.objects.select_related("party", "amad")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return LoanListSerializer
        if self.action == "create":
            return LoanCreateSerializer
        return LoanDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        loan_status = self.request.query_params.get("status")
        party_id = self.request.query_params.get("party_id")
        amad_id = self.request.query_params.get("amad_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if loan_status:
            queryset = queryset.filter(status=loan_status)
        if party_id:
            queryset = queryset.filter(party_id=party_id)
        if amad_id:
            queryset = queryset.filter(amad_id=amad_id)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset

    def create(self, request, *args, **kwargs):
        """Create a new loan."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = LoanCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = LoanService(organization)
        try:
            loan = service.create_loan(serializer.validated_data, user=request.user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            LoanDetailSerializer(loan).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a loan."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("reason", "")
        if not reason:
            return Response(
                {"error": "Cancellation reason is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = LoanService(organization)
        try:
            loan = service.cancel_loan(pk, reason, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except LoanAgainstGoods.DoesNotExist:
            return Response(
                {"error": "Loan not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(LoanDetailSerializer(loan).data)

    @action(detail=False, methods=["get"], url_path="collateral-amads")
    def collateral_amads(self, request):
        """Get amads eligible as loan collateral for a party."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        party_id = request.query_params.get("party_id")
        if not party_id:
            return Response(
                {"error": "party_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amads = Amad.objects.filter(
            organization=organization,
            party_id=party_id,
            is_fully_dispatched=False,
        ).select_related("party", "commodity").order_by("date", "amad_no")

        serializer = CollateralAmadSerializer(amads, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="party-ledger")
    def party_ledger(self, request):
        """Get loan ledger for a party."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        party_id = request.query_params.get("party_id")
        if not party_id:
            return Response(
                {"error": "party_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from apps.accounting.models import Account

        try:
            party = Account.objects.get(id=party_id, organization=organization)
        except Account.DoesNotExist:
            return Response(
                {"error": "Party not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        service = LoanService(organization)
        entries = service.get_party_loan_ledger(party_id)

        entries_data = LoanLedgerEntrySerializer(entries, many=True).data

        # Calculate totals
        from decimal import Decimal

        total_dr = sum(
            Decimal(str(e["amount"])) for e in entries_data if e["entry_type"] == "DR"
        )
        total_cr = sum(
            Decimal(str(e["amount"])) for e in entries_data if e["entry_type"] == "CR"
        )

        response_data = {
            "party_id": str(party.id),
            "party_name": party.name,
            "total_dr": total_dr,
            "total_cr": total_cr,
            "outstanding": total_dr - total_cr,
            "entries": entries_data,
        }

        serializer = PartyLoanLedgerSerializer(response_data)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="calculate-interest")
    def calculate_interest(self, request):
        """Calculate interest on active loans."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        party_id = request.query_params.get("party_id")
        to_date = request.query_params.get("to_date")

        service = LoanService(organization)

        import datetime

        parsed_date = None
        if to_date:
            try:
                parsed_date = datetime.date.fromisoformat(to_date)
            except ValueError:
                return Response(
                    {"error": "Invalid to_date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        results = service.calculate_interest(party_id=party_id, to_date=parsed_date)
        serializer = InterestCalculationItemSerializer(results, many=True)
        return Response(serializer.data)
