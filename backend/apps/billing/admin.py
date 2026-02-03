from django.contrib import admin

from .models import (
    PriceBreakup,
    Receipt,
    ReceiptAllocation,
    RentBillHeader,
    RentBillItem,
)


class RentBillItemInline(admin.TabularInline):
    model = RentBillItem
    extra = 0
    readonly_fields = ["amad_no", "amad_date", "commodity_name", "party_name"]


class PriceBreakupInline(admin.TabularInline):
    model = PriceBreakup
    extra = 0


@admin.register(RentBillHeader)
class RentBillHeaderAdmin(admin.ModelAdmin):
    list_display = [
        "bill_no",
        "bill_date",
        "party_name",
        "taxable_amount",
        "total_gst",
        "net_amount",
        "paid_amount",
        "balance_amount",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status", "gst_type", "bill_date"]
    search_fields = ["bill_no", "party_name", "party_gstin"]
    ordering = ["organization", "-bill_date", "-bill_no"]
    inlines = [RentBillItemInline, PriceBreakupInline]
    readonly_fields = [
        "bill_no",
        "taxable_amount",
        "cgst_amount",
        "sgst_amount",
        "igst_amount",
        "total_gst",
        "total_amount",
        "round_off",
        "net_amount",
        "balance_amount",
    ]


@admin.register(RentBillItem)
class RentBillItemAdmin(admin.ModelAdmin):
    list_display = [
        "rent_bill",
        "amad_no",
        "amad_date",
        "total_packets",
        "weight_qtl",
        "storage_days",
        "billable_days",
        "rent_amount",
    ]
    list_filter = ["organization"]
    search_fields = ["amad_no", "rent_bill__bill_no"]


class ReceiptAllocationInline(admin.TabularInline):
    model = ReceiptAllocation
    extra = 0


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = [
        "receipt_no",
        "receipt_date",
        "party",
        "amount",
        "payment_mode",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status", "payment_mode", "receipt_date"]
    search_fields = ["receipt_no", "party__name", "cheque_no", "bank_ref_no"]
    ordering = ["organization", "-receipt_date", "-receipt_no"]
    inlines = [ReceiptAllocationInline]
    readonly_fields = ["receipt_no"]


@admin.register(ReceiptAllocation)
class ReceiptAllocationAdmin(admin.ModelAdmin):
    list_display = [
        "receipt",
        "rent_bill",
        "allocated_amount",
    ]
    list_filter = ["organization"]
    search_fields = ["receipt__receipt_no", "rent_bill__bill_no"]
