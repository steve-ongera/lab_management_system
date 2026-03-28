from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
import uuid


class Participant(models.Model):
    SEX_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    participant_id = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=80, unique=True, blank=True)
    study_name = models.CharField(max_length=200)
    date_of_birth = models.DateField()
    age = models.PositiveIntegerField()
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    enrollment_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='participants_created')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.participant_id)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.participant_id} - {self.study_name}"

    class Meta:
        ordering = ['-enrollment_date']


class Phlebotomy(models.Model):
    SAMPLE_TYPE_CHOICES = [('blood','Blood'),('sputum','Sputum'),('urine','Urine'),('other','Other')]
    TUBE_TYPE_CHOICES = [
        ('EDTA','EDTA'),('LIHEP','Li-Hep'),('SST','SST'),
        ('SODIUM_CITRATE','Sodium Citrate'),('BLOOD_CULTURE','Blood Culture'),
        ('RED_TOP','Red Top'),('URINE_CONTAINER','Urine Container'),('OTHER','Other'),
    ]
    VOLUME_CHOICES = [('3ML','3 mL'),('6ML','6 mL'),('10ML','10 mL'),('OTHER','Other')]
    SITE_CHOICES = [('venous','Venous'),('capillary','Capillary'),('arterial','Arterial')]
    NOTES_CHOICES = [('SUFFICIENT','Sufficient'),('INSUFFICIENT','Insufficient'),('OTHER','Other')]
    VISIT_CHOICES = [('screening','Screening'),('baseline','Baseline'),('follow_up','Follow-up'),('exit','Exit'),('unscheduled','Unscheduled')]

    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name='phlebotomies')
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    collector_name = models.CharField(max_length=100)
    collection_date = models.DateField()
    collection_time = models.TimeField()
    sample_type = models.CharField(max_length=20, choices=SAMPLE_TYPE_CHOICES)
    tube_type = models.CharField(max_length=20, choices=TUBE_TYPE_CHOICES)
    volume_collected = models.CharField(max_length=10, choices=VOLUME_CHOICES)
    collection_site = models.CharField(max_length=20, choices=SITE_CHOICES)
    collection_notes = models.CharField(max_length=20, choices=NOTES_CHOICES)
    collection_notes_other = models.TextField(blank=True)
    consented = models.BooleanField(default=True)
    visit_type = models.CharField(max_length=20, choices=VISIT_CHOICES)
    sample_collected = models.BooleanField(default=True)
    no_collection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='phlebotomies_created')

    def save(self, *args, **kwargs):
        if not self.slug:
            base = f"{self.participant.participant_id}-{self.collection_date}-{self.sample_type}"
            self.slug = slugify(base) + '-' + str(uuid.uuid4())[:6]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.participant.participant_id} | {self.collection_date} | {self.sample_type}"

    class Meta:
        ordering = ['-collection_date', '-collection_time']
        verbose_name_plural = 'Phlebotomies'


class SampleProcessing(models.Model):
    PROCESSING_CHOICES = [('centrifugation','Centrifugation'),('incubation','Incubation'),('aliquoting','Aliquoting'),('other','Other')]
    EQUIPMENT_CHOICES = [('ref_centrifuge','Refrigerated Centrifuge'),('non_ref_centrifuge','Non-Refrigerated Centrifuge'),('other','Other')]

    phlebotomy = models.ForeignKey(Phlebotomy, on_delete=models.CASCADE, related_name='processings')
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    accession_number = models.CharField(max_length=50, unique=True)
    reception_date = models.DateField()
    reception_time = models.TimeField()
    tubes_edta = models.PositiveIntegerField(default=0)
    tubes_lihep = models.PositiveIntegerField(default=0)
    tubes_sst = models.PositiveIntegerField(default=0)
    tubes_sodium_citrate = models.PositiveIntegerField(default=0)
    tubes_blood_culture = models.PositiveIntegerField(default=0)
    tubes_red_top = models.PositiveIntegerField(default=0)
    tubes_other = models.PositiveIntegerField(default=0)
    processing_type = models.CharField(max_length=20, choices=PROCESSING_CHOICES)
    aliquot_number = models.CharField(max_length=50, blank=True)
    technologist_initials = models.CharField(max_length=10)
    equipment_used = models.CharField(max_length=30, choices=EQUIPMENT_CHOICES, blank=True)
    centrifugation_start = models.DateTimeField(null=True, blank=True)
    centrifugation_end = models.DateTimeField(null=True, blank=True)
    incubation_start = models.DateTimeField(null=True, blank=True)
    incubation_end = models.DateTimeField(null=True, blank=True)
    results_dispatch_time = models.DateTimeField(null=True, blank=True)
    results_dispatched_to = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='processings_created')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.accession_number) + '-' + str(uuid.uuid4())[:6]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"ACC: {self.accession_number} | {self.reception_date}"

    class Meta:
        ordering = ['-reception_date']
        verbose_name_plural = 'Sample Processings'


class SampleStorage(models.Model):
    TEMP_CHOICES = [('2-8','2°C to 8°C'),('-20','-20°C'),('-80','-80°C')]
    CONDITION_CHOICES = [('good','Good'),('compromised','Compromised')]

    processing = models.OneToOneField(SampleProcessing, on_delete=models.CASCADE, related_name='storage')
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    sample_id = models.CharField(max_length=50, unique=True)
    freezer_id = models.CharField(max_length=50, blank=True)
    fridge_id = models.CharField(max_length=50, blank=True)
    shelf_number = models.CharField(max_length=20, blank=True)
    rack_number = models.CharField(max_length=20, blank=True)
    box_number = models.CharField(max_length=20, blank=True)
    position = models.CharField(max_length=20, blank=True)
    storage_temperature = models.CharField(max_length=10, choices=TEMP_CHOICES)
    date_stored = models.DateField()
    storage_condition = models.CharField(max_length=15, choices=CONDITION_CHOICES, default='good')
    retrieval_datetime = models.DateTimeField(null=True, blank=True)
    retrieved_by = models.CharField(max_length=100, blank=True)
    retrieval_condition = models.CharField(max_length=15, choices=CONDITION_CHOICES, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='storages_created')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.sample_id) + '-' + str(uuid.uuid4())[:6]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Sample {self.sample_id} @ {self.storage_temperature}"

    class Meta:
        ordering = ['-date_stored']
        verbose_name_plural = 'Sample Storages'


class StockItem(models.Model):
    CATEGORY_CHOICES = [('reagent','Reagent'),('consumable','Consumable')]
    UNIT_CHOICES = [('pieces','Pieces'),('boxes','Boxes'),('liters','Liters'),('other','Other')]
    LOCATION_CHOICES = [('main_store','Main Store'),('departmental_store','Departmental Store'),('quarantine_store','Quarantine Store')]
    CONDITION_CHOICES = [('good','Good'),('damaged','Damaged'),('expired','Expired')]

    item_id = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    item_name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    supplier = models.CharField(max_length=200)
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField()
    quantity_available = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    storage_location = models.CharField(max_length=20, choices=LOCATION_CHOICES)
    last_updated = models.DateTimeField(auto_now=True)
    condition_received = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='good')
    rejection_reason = models.TextField(blank=True)
    received_by = models.CharField(max_length=100)
    reception_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='stocks_created')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.item_id + '-' + self.item_name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.item_name} ({self.item_id})"

    class Meta:
        ordering = ['item_name']
        verbose_name = 'Stock Item'


class AuditLog(models.Model):
    ACTION_CHOICES = [('create','Create'),('update','Update'),('delete','Delete')]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=50)
    object_repr = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    changes = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.user} | {self.action} | {self.model_name}"

    class Meta:
        ordering = ['-timestamp']