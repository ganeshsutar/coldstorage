from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Organization, OrganizationMembership, User


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for Organization model."""

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "name_hindi",
            "slug",
            "address",
            "city",
            "state",
            "phone",
            "email",
            "gst_no",
            "logo_url",
            "timezone",
            "financial_year_start",
            "billing_status",
            "subscription_plan",
            "is_active",
            "is_configured",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class OrganizationMembershipSerializer(serializers.ModelSerializer):
    """Serializer for OrganizationMembership with nested organization."""

    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = OrganizationMembership
        fields = [
            "id",
            "organization",
            "role",
            "is_default",
            "status",
            "joined_at",
        ]
        read_only_fields = ["id", "joined_at"]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "avatar_url",
            "email_verified",
            "is_active",
            "last_login_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "email_verified",
            "is_active",
            "last_login_at",
            "created_at",
            "updated_at",
        ]


class UserWithOrganizationsSerializer(serializers.ModelSerializer):
    """Serializer for User with their organization memberships."""

    organizations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "avatar_url",
            "email_verified",
            "is_active",
            "last_login_at",
            "created_at",
            "updated_at",
            "organizations",
        ]
        read_only_fields = [
            "id",
            "email_verified",
            "is_active",
            "last_login_at",
            "created_at",
            "updated_at",
        ]

    def get_organizations(self, obj):
        memberships = obj.memberships.filter(
            status=OrganizationMembership.Status.ACTIVE
        ).select_related("organization")
        return OrganizationMembershipSerializer(memberships, many=True).data


class SignupSerializer(serializers.Serializer):
    """Serializer for user registration."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_email(self, value):
        """Check that email is not already registered."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_password(self, value):
        """Validate password against Django's password validators."""
        validate_password(value)
        return value

    def create(self, validated_data):
        """Create and return a new user."""
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            phone=validated_data.get("phone"),
        )


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Authenticate user with email and password."""
        email = attrs.get("email", "").lower()
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")

        attrs["user"] = user
        return attrs
