from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounting.views import OrganizationMixin

from .models import BardanaIssueHeader, BardanaReturnHeader, BardanaType
from .serializers import (
    BardanaIssueCreateSerializer,
    BardanaIssueDetailSerializer,
    BardanaIssueListSerializer,
    BardanaReturnCreateSerializer,
    BardanaReturnDetailSerializer,
    BardanaReturnListSerializer,
    BardanaTypeCreateSerializer,
    BardanaTypeSerializer,
    PartyOutstandingSerializer,
    StockSummarySerializer,
)
from .services import BardanaService


class BardanaTypeViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for BardanaType CRUD."""

    queryset = BardanaType.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return BardanaTypeCreateSerializer
        return BardanaTypeSerializer


class BardanaIssueViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Bardana Issues."""

    queryset = BardanaIssueHeader.objects.select_related("party")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return BardanaIssueListSerializer
        if self.action == "create":
            return BardanaIssueCreateSerializer
        return BardanaIssueDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        issue_status = self.request.query_params.get("status")
        party_id = self.request.query_params.get("party_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if issue_status:
            queryset = queryset.filter(status=issue_status)
        if party_id:
            queryset = queryset.filter(party_id=party_id)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset.prefetch_related("items", "items__bardana_type")

    def create(self, request, *args, **kwargs):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = BardanaIssueCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = BardanaService(organization)
        try:
            issue = service.create_issue(serializer.validated_data, user=request.user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            BardanaIssueDetailSerializer(issue).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = BardanaService(organization)
        try:
            issue = service.confirm_issue(pk, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BardanaIssueHeader.DoesNotExist:
            return Response(
                {"error": "Issue not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(BardanaIssueDetailSerializer(issue).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
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

        service = BardanaService(organization)
        try:
            issue = service.cancel_issue(pk, reason, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BardanaIssueHeader.DoesNotExist:
            return Response(
                {"error": "Issue not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(BardanaIssueDetailSerializer(issue).data)


class BardanaReturnViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Bardana Returns."""

    queryset = BardanaReturnHeader.objects.select_related("party")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return BardanaReturnListSerializer
        if self.action == "create":
            return BardanaReturnCreateSerializer
        return BardanaReturnDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        return_status = self.request.query_params.get("status")
        party_id = self.request.query_params.get("party_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if return_status:
            queryset = queryset.filter(status=return_status)
        if party_id:
            queryset = queryset.filter(party_id=party_id)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset.prefetch_related("items", "items__bardana_type")

    def create(self, request, *args, **kwargs):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = BardanaReturnCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = BardanaService(organization)
        try:
            ret = service.create_return(serializer.validated_data, user=request.user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            BardanaReturnDetailSerializer(ret).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = BardanaService(organization)
        try:
            ret = service.confirm_return(pk, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BardanaReturnHeader.DoesNotExist:
            return Response(
                {"error": "Return not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(BardanaReturnDetailSerializer(ret).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
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

        service = BardanaService(organization)
        try:
            ret = service.cancel_return(pk, reason, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BardanaReturnHeader.DoesNotExist:
            return Response(
                {"error": "Return not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(BardanaReturnDetailSerializer(ret).data)


class BardanaStatsViewSet(OrganizationMixin, viewsets.ViewSet):
    """ViewSet for Bardana statistics."""

    permission_classes = [IsAuthenticated]
    # Provide a default queryset for OrganizationMixin
    queryset = BardanaType.objects.none()

    @action(detail=False, methods=["get"], url_path="stock-summary")
    def stock_summary(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = BardanaService(organization)
        summary = service.get_stock_summary()
        serializer = StockSummarySerializer(summary)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="party-outstanding")
    def party_outstanding(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        party_id = request.query_params.get("party_id")
        service = BardanaService(organization)

        if party_id:
            try:
                outstanding = service.get_party_outstanding(party_id)
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = PartyOutstandingSerializer(outstanding)
            return Response(serializer.data)
        else:
            outstanding_list = service.get_all_party_outstanding()
            serializer = PartyOutstandingSerializer(outstanding_list, many=True)
            return Response(serializer.data)
