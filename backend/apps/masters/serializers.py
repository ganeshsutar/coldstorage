from rest_framework import serializers

from .models import Bank, GstRate, LaborRate


# =============================================================================
# GST Rate Serializers
# =============================================================================


class GstRateListSerializer(serializers.ModelSerializer):
    """Serializer for listing GST rates."""

    total_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, read_only=True
    )

    class Meta:
        model = GstRate
        fields = [
            "id",
            "code",
            "description",
            "cgst_rate",
            "sgst_rate",
            "igst_rate",
            "total_rate",
            "hsn_code",
            "is_default",
            "is_active",
        ]


class GstRateDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for GST rate."""

    total_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, read_only=True
    )

    class Meta:
        model = GstRate
        fields = [
            "id",
            "organization",
            "code",
            "description",
            "cgst_rate",
            "sgst_rate",
            "igst_rate",
            "total_rate",
            "hsn_code",
            "is_default",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class GstRateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating GST rates."""

    class Meta:
        model = GstRate
        fields = [
            "code",
            "description",
            "cgst_rate",
            "sgst_rate",
            "igst_rate",
            "hsn_code",
            "is_default",
            "is_active",
        ]

    def validate_code(self, value):
        organization = self.context.get("organization")
        if organization:
            exists = GstRate.objects.filter(
                organization=organization, code=value
            ).exclude(pk=self.instance.pk if self.instance else None).exists()
            if exists:
                raise serializers.ValidationError("A GST rate with this code already exists.")
        return value

    def validate(self, attrs):
        cgst_rate = attrs.get("cgst_rate", self.instance.cgst_rate if self.instance else 0)
        sgst_rate = attrs.get("sgst_rate", self.instance.sgst_rate if self.instance else 0)
        igst_rate = attrs.get("igst_rate", self.instance.igst_rate if self.instance else 0)

        # IGST should equal CGST + SGST
        if igst_rate != cgst_rate + sgst_rate:
            raise serializers.ValidationError({
                "igst_rate": "IGST rate should equal CGST + SGST rates."
            })

        return attrs


# =============================================================================
# Bank Serializers
# =============================================================================


class BankListSerializer(serializers.ModelSerializer):
    """Serializer for listing banks."""

    class Meta:
        model = Bank
        fields = [
            "id",
            "code",
            "name",
            "ifsc_pattern",
            "is_active",
        ]


class BankDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for bank."""

    class Meta:
        model = Bank
        fields = [
            "id",
            "organization",
            "code",
            "name",
            "ifsc_pattern",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class BankCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating banks."""

    class Meta:
        model = Bank
        fields = [
            "code",
            "name",
            "ifsc_pattern",
            "is_active",
        ]

    def validate_code(self, value):
        organization = self.context.get("organization")
        if organization:
            exists = Bank.objects.filter(
                organization=organization, code=value
            ).exclude(pk=self.instance.pk if self.instance else None).exists()
            if exists:
                raise serializers.ValidationError("A bank with this code already exists.")
        return value


# =============================================================================
# Labor Rate Serializers
# =============================================================================


class LaborRateListSerializer(serializers.ModelSerializer):
    """Serializer for listing labor rates."""

    rate_type_display = serializers.CharField(source="get_rate_type_display", read_only=True)
    packet_type_display = serializers.CharField(source="get_packet_type_display", read_only=True)

    class Meta:
        model = LaborRate
        fields = [
            "id",
            "rate_type",
            "rate_type_display",
            "packet_type",
            "packet_type_display",
            "rate",
            "effective_from",
            "is_active",
        ]


class LaborRateDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for labor rate."""

    rate_type_display = serializers.CharField(source="get_rate_type_display", read_only=True)
    packet_type_display = serializers.CharField(source="get_packet_type_display", read_only=True)

    class Meta:
        model = LaborRate
        fields = [
            "id",
            "organization",
            "rate_type",
            "rate_type_display",
            "packet_type",
            "packet_type_display",
            "rate",
            "effective_from",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class LaborRateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating labor rates."""

    class Meta:
        model = LaborRate
        fields = [
            "rate_type",
            "packet_type",
            "rate",
            "effective_from",
            "is_active",
        ]

    def validate(self, attrs):
        organization = self.context.get("organization")
        rate_type = attrs.get("rate_type")
        packet_type = attrs.get("packet_type")
        effective_from = attrs.get("effective_from")

        if organization and rate_type and effective_from:
            exists = LaborRate.objects.filter(
                organization=organization,
                rate_type=rate_type,
                packet_type=packet_type,
                effective_from=effective_from,
            ).exclude(pk=self.instance.pk if self.instance else None).exists()
            if exists:
                raise serializers.ValidationError(
                    "A labor rate with this type, packet type, and effective date already exists."
                )

        return attrs
