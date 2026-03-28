from django.contrib import admin
from .models import Participant, Phlebotomy, SampleProcessing, SampleStorage, StockItem, AuditLog

@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ['participant_id', 'study_name', 'sex', 'age', 'enrollment_date']
    search_fields = ['participant_id', 'study_name']
    list_filter = ['sex', 'study_name']

@admin.register(Phlebotomy)
class PhlebotomyAdmin(admin.ModelAdmin):
    list_display = ['participant', 'collection_date', 'sample_type', 'tube_type', 'collector_name']
    search_fields = ['participant__participant_id', 'collector_name']
    list_filter = ['sample_type', 'tube_type', 'visit_type']

@admin.register(SampleProcessing)
class SampleProcessingAdmin(admin.ModelAdmin):
    list_display = ['accession_number', 'processing_type', 'reception_date', 'technologist_initials']
    search_fields = ['accession_number', 'technologist_initials']

@admin.register(SampleStorage)
class SampleStorageAdmin(admin.ModelAdmin):
    list_display = ['sample_id', 'storage_temperature', 'date_stored', 'storage_condition']
    search_fields = ['sample_id', 'freezer_id']
    list_filter = ['storage_temperature', 'storage_condition']

@admin.register(StockItem)
class StockItemAdmin(admin.ModelAdmin):
    list_display = ['item_id', 'item_name', 'category', 'quantity_available', 'expiry_date']
    search_fields = ['item_id', 'item_name', 'supplier']
    list_filter = ['category', 'storage_location', 'condition_received']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'model_name', 'object_repr', 'timestamp']
    list_filter = ['action', 'model_name']
    readonly_fields = ['user', 'action', 'model_name', 'object_id', 'object_repr', 'timestamp', 'changes']