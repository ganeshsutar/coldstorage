from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounting.views import OrganizationMixin
from apps.inventory.models import Amad

from .models import BillStatus, Receipt, RentBillHeader
from .serializers import (
    BillableAmadSerializer,
    BillingStatsSerializer,
    PartyOutstandingSerializer,
    ReceiptCreateSerializer,
    ReceiptDetailSerializer,
    ReceiptListSerializer,
    RentBillCreateSerializer,
    RentBillDetailSerializer,
    RentBillListSerializer,
)
from .services import BillingService


class RentBillViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Rent Bill model."""

    queryset = RentBillHeader.objects.select_related("party", "gst_rate")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return RentBillListSerializer
        if self.action == "create":
            return RentBillCreateSerializer
        return RentBillDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        bill_status = self.request.query_params.get("status")
        party_id = self.request.query_params.get("party_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if bill_status:
            queryset = queryset.filter(status=bill_status)
        if party_id:
            queryset = queryset.filter(party_id=party_id)
        if from_date:
            queryset = queryset.filter(bill_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(bill_date__lte=to_date)

        return queryset.prefetch_related("items", "breakups")

    def create(self, request, *args, **kwargs):
        """Create a rent bill via the wizard."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RentBillCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = BillingService(organization)
        try:
            bill = service.create_rent_bill(serializer.validated_data, user=request.user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            RentBillDetailSerializer(bill).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="billable-amads")
    def billable_amads(self, request):
        """Get amads available for billing."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        party_id = request.query_params.get("party_id")
        service = BillingService(organization)
        amads = service.get_billable_amads(party_id)

        serializer = BillableAmadSerializer(amads, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        """Confirm a draft bill."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = BillingService(organization)
        try:
            bill = service.confirm_bill(pk, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except RentBillHeader.DoesNotExist:
            return Response(
                {"error": "Bill not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(RentBillDetailSerializer(bill).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a bill."""
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

        service = BillingService(organization)
        try:
            bill = service.cancel_bill(pk, reason, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except RentBillHeader.DoesNotExist:
            return Response(
                {"error": "Bill not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(RentBillDetailSerializer(bill).data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get billing statistics."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = BillingService(organization)
        stats = service.get_billing_stats()

        serializer = BillingStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="party-outstanding")
    def party_outstanding(self, request):
        """Get outstanding bills for a party."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        party_id = request.query_params.get("party_id")
        if not party_id:
            return Response(
                {"error": "party_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = BillingService(organization)
        try:
            outstanding = service.get_party_outstanding(party_id)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Serialize bills
        outstanding["bills"] = RentBillListSerializer(outstanding["bills"], many=True).data

        serializer = PartyOutstandingSerializer(outstanding)
        return Response(serializer.data)


class ReceiptViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Receipt model."""

    queryset = Receipt.objects.select_related("party")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return ReceiptListSerializer
        if self.action == "create":
            return ReceiptCreateSerializer
        return ReceiptDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        receipt_status = self.request.query_params.get("status")
        party_id = self.request.query_params.get("party_id")
        payment_mode = self.request.query_params.get("payment_mode")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if receipt_status:
            queryset = queryset.filter(status=receipt_status)
        if party_id:
            queryset = queryset.filter(party_id=party_id)
        if payment_mode:
            queryset = queryset.filter(payment_mode=payment_mode)
        if from_date:
            queryset = queryset.filter(receipt_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(receipt_date__lte=to_date)

        return queryset.prefetch_related("allocations", "allocations__rent_bill")

    def create(self, request, *args, **kwargs):
        """Create a receipt."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReceiptCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = BillingService(organization)
        try:
            receipt = service.create_receipt(serializer.validated_data, user=request.user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            ReceiptDetailSerializer(receipt).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        """Confirm a receipt."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = BillingService(organization)
        try:
            receipt = service.confirm_receipt(pk, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Receipt.DoesNotExist:
            return Response(
                {"error": "Receipt not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(ReceiptDetailSerializer(receipt).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a receipt."""
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

        service = BillingService(organization)
        try:
            receipt = service.cancel_receipt(pk, reason, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Receipt.DoesNotExist:
            return Response(
                {"error": "Receipt not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(ReceiptDetailSerializer(receipt).data)

    @action(detail=False, methods=["get"], url_path="unpaid-bills")
    def unpaid_bills(self, request):
        """Get unpaid bills for a party (for allocation)."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        party_id = request.query_params.get("party_id")
        if not party_id:
            return Response(
                {"error": "party_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        bills = RentBillHeader.objects.filter(
            organization=organization,
            party_id=party_id,
            status__in=[BillStatus.CONFIRMED, BillStatus.PARTIAL_PAID],
        ).order_by("bill_date", "bill_no")

        serializer = RentBillListSerializer(bills, many=True)
        return Response(serializer.data)
