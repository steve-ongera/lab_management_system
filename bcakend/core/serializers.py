from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Participant, Phlebotomy, SampleProcessing, SampleStorage, StockItem, AuditLog


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff']


class ParticipantSerializer(serializers.ModelSerializer):
    created_by_name = serializers.StringRelatedField(source='created_by', read_only=True)
    sex_display = serializers.CharField(source='get_sex_display', read_only=True)

    class Meta:
        model = Participant
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'updated_at', 'created_by']


class PhlebotomySerializer(serializers.ModelSerializer):
    participant_id_display = serializers.CharField(source='participant.participant_id', read_only=True)
    sample_type_display = serializers.CharField(source='get_sample_type_display', read_only=True)
    tube_type_display = serializers.CharField(source='get_tube_type_display', read_only=True)
    visit_type_display = serializers.CharField(source='get_visit_type_display', read_only=True)

    class Meta:
        model = Phlebotomy
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'updated_at', 'created_by']


class SampleProcessingSerializer(serializers.ModelSerializer):
    participant_id = serializers.CharField(source='phlebotomy.participant.participant_id', read_only=True)
    processing_type_display = serializers.CharField(source='get_processing_type_display', read_only=True)

    class Meta:
        model = SampleProcessing
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'updated_at', 'created_by']


class SampleStorageSerializer(serializers.ModelSerializer):
    accession_number = serializers.CharField(source='processing.accession_number', read_only=True)
    participant_id = serializers.CharField(source='processing.phlebotomy.participant.participant_id', read_only=True)
    temperature_display = serializers.CharField(source='get_storage_temperature_display', read_only=True)

    class Meta:
        model = SampleStorage
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'updated_at', 'created_by']


class StockItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    location_display = serializers.CharField(source='get_storage_location_display', read_only=True)
    is_expired = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()

    class Meta:
        model = StockItem
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'last_updated', 'created_by']

    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.expiry_date < timezone.now().date()

    def get_is_low_stock(self, obj):
        return float(obj.quantity_available) <= 10


class AuditLogSerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'