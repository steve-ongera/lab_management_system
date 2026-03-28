"""
LIMS Seed Data Management Command
==================================
Usage:
    python manage.py seed_data              # seed with default data
    python manage.py seed_data --clear      # clear all data first, then seed
    python manage.py seed_data --clear-only # clear all data without seeding

Populates the database with realistic laboratory sample data across all modules:
    - Users (admin + lab staff)
    - Participants (20 participants across 3 studies)
    - Phlebotomy records (40 collection records)
    - Sample Processing (30 processing records)
    - Sample Storage (25 storage records)
    - Stock Inventory (20 stock items)

All data is realistic and consistent — phlebotomy links to participants,
processing links to phlebotomy, storage links to processing.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from core.models import (
    Participant, Phlebotomy, SampleProcessing,
    SampleStorage, StockItem, AuditLog
)
from datetime import date, time, timedelta, datetime
import random


class Command(BaseCommand):
    help = 'Seed the database with realistic LIMS sample data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing data before seeding',
        )
        parser.add_argument(
            '--clear-only',
            action='store_true',
            help='Only clear data, do not seed',
        )

    def handle(self, *args, **options):
        if options['clear'] or options['clear_only']:
            self.clear_data()
            if options['clear_only']:
                self.stdout.write(self.style.SUCCESS('✓ All LIMS data cleared.'))
                return

        self.stdout.write(self.style.MIGRATE_HEADING('\n🧪 Seeding LIMS database...\n'))

        admin    = self.create_users()
        parts    = self.create_participants(admin)
        phlebs   = self.create_phlebotomy(parts, admin)
        procs    = self.create_processing(phlebs, admin)
        self.create_storage(procs, admin)
        self.create_stock(admin)

        self.stdout.write(self.style.SUCCESS('\n✅ Seeding complete!\n'))
        self.stdout.write('   Login → http://localhost:5173')
        self.stdout.write('   Username: admin  |  Password: admin123\n')

    # ─────────────────────────────────────────────
    # CLEAR
    # ─────────────────────────────────────────────
    def clear_data(self):
        self.stdout.write('  Clearing existing data...')
        AuditLog.objects.all().delete()
        SampleStorage.objects.all().delete()
        SampleProcessing.objects.all().delete()
        Phlebotomy.objects.all().delete()
        Participant.objects.all().delete()
        StockItem.objects.all().delete()
        User.objects.filter(username__in=['lab_tech', 'phlebotomist', 'store_keeper']).delete()
        self.stdout.write(self.style.WARNING('  ✓ Data cleared.'))

    # ─────────────────────────────────────────────
    # USERS
    # ─────────────────────────────────────────────
    def create_users(self):
        self.stdout.write('  Creating users...')

        admin, created = User.objects.get_or_create(username='admin')
        if created or not admin.is_superuser:
            admin.set_password('admin123')
            admin.is_staff = True
            admin.is_superuser = True
            admin.first_name = 'System'
            admin.last_name = 'Administrator'
            admin.email = 'admin@lims.local'
            admin.save()

        staff_users = [
            ('lab_tech',      'lab123',   'James',    'Waweru',    'labtech@lims.local',   True,  False),
            ('phlebotomist',  'phle123',  'Grace',    'Muthoni',   'phle@lims.local',      True,  False),
            ('store_keeper',  'store123', 'Peter',    'Otieno',    'store@lims.local',     True,  False),
        ]
        for uname, pwd, first, last, email, is_staff, is_super in staff_users:
            u, _ = User.objects.get_or_create(username=uname)
            u.set_password(pwd)
            u.first_name = first
            u.last_name  = last
            u.email      = email
            u.is_staff   = is_staff
            u.is_superuser = is_super
            u.save()

        self.stdout.write(self.style.SUCCESS('  ✓ 4 users created.'))
        return admin

    # ─────────────────────────────────────────────
    # PARTICIPANTS
    # ─────────────────────────────────────────────
    def create_participants(self, admin):
        self.stdout.write('  Creating participants...')

        lab_tech = User.objects.get(username='lab_tech')

        # Raw participant data: (id, study, dob, age, sex, enrollment_date)
        data = [
            # ── COVID-19 Cohort ──────────────────────────────────────
            ('KNH-001', 'COVID-19 Cohort',          date(1990, 5, 12),  34, 'M', date(2024, 1, 10)),
            ('KNH-002', 'COVID-19 Cohort',          date(1985, 3, 22),  39, 'F', date(2024, 1, 15)),
            ('KNH-003', 'COVID-19 Cohort',          date(1972, 11, 3),  52, 'M', date(2024, 1, 18)),
            ('KNH-004', 'COVID-19 Cohort',          date(1998, 7, 30),  26, 'F', date(2024, 1, 22)),
            ('KNH-005', 'COVID-19 Cohort',          date(1965, 2, 14),  59, 'M', date(2024, 1, 25)),
            ('KNH-006', 'COVID-19 Cohort',          date(2001, 9, 5),   23, 'F', date(2024, 2, 1)),
            ('KNH-007', 'COVID-19 Cohort',          date(1988, 4, 18),  36, 'M', date(2024, 2, 5)),
            ('KNH-008', 'COVID-19 Cohort',          date(1993, 12, 27), 31, 'F', date(2024, 2, 8)),

            # ── Malaria Intervention Study ────────────────────────────
            ('MIS-001', 'Malaria Intervention Study', date(2000, 7, 4),  24, 'M', date(2024, 2, 12)),
            ('MIS-002', 'Malaria Intervention Study', date(1995, 1, 19), 29, 'F', date(2024, 2, 14)),
            ('MIS-003', 'Malaria Intervention Study', date(1980, 6, 23), 44, 'M', date(2024, 2, 19)),
            ('MIS-004', 'Malaria Intervention Study', date(2003, 10, 8), 21, 'F', date(2024, 2, 22)),
            ('MIS-005', 'Malaria Intervention Study', date(1977, 3, 31), 47, 'M', date(2024, 3, 1)),
            ('MIS-006', 'Malaria Intervention Study', date(1991, 8, 15), 33, 'F', date(2024, 3, 5)),
            ('MIS-007', 'Malaria Intervention Study', date(2005, 2, 28), 19, 'M', date(2024, 3, 8)),

            # ── TB Prevalence Survey ──────────────────────────────────
            ('TBS-001', 'TB Prevalence Survey',     date(1969, 4, 6),   55, 'F', date(2024, 3, 12)),
            ('TBS-002', 'TB Prevalence Survey',     date(1983, 9, 21),  41, 'M', date(2024, 3, 15)),
            ('TBS-003', 'TB Prevalence Survey',     date(1996, 11, 10), 28, 'F', date(2024, 3, 19)),
            ('TBS-004', 'TB Prevalence Survey',     date(1974, 5, 17),  50, 'M', date(2024, 3, 22)),
            ('TBS-005', 'TB Prevalence Survey',     date(2002, 8, 3),   22, 'F', date(2024, 3, 26)),
        ]

        participants = []
        for pid, study, dob, age, sex, enr in data:
            if Participant.objects.filter(participant_id=pid).exists():
                participants.append(Participant.objects.get(participant_id=pid))
                continue
            p = Participant.objects.create(
                participant_id=pid,
                study_name=study,
                date_of_birth=dob,
                age=age,
                sex=sex,
                enrollment_date=enr,
                created_by=lab_tech,
            )
            participants.append(p)

        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(participants)} participants created.'))
        return participants

    # ─────────────────────────────────────────────
    # PHLEBOTOMY
    # ─────────────────────────────────────────────
    def create_phlebotomy(self, participants, admin):
        self.stdout.write('  Creating phlebotomy records...')

        phlebotomist = User.objects.get(username='phlebotomist')

        collectors = ['Dr. Grace Muthoni', 'Dr. James Waweru', 'Nurse Achieng', 'Nurse Kamau']

        # Each entry: (participant_index, date_offset_days, sample_type, tube_type, volume, site, notes, consented, visit_type, collected)
        records = [
            # COVID-19 Cohort — screening + baseline visits
            (0,  2,  'blood', 'EDTA',           '6ML',   'venous',    'SUFFICIENT',   True,  'screening',  True),
            (0,  5,  'blood', 'SST',            '10ML',  'venous',    'SUFFICIENT',   True,  'baseline',   True),
            (1,  3,  'blood', 'EDTA',           '6ML',   'venous',    'SUFFICIENT',   True,  'screening',  True),
            (1,  7,  'blood', 'LIHEP',          '6ML',   'venous',    'SUFFICIENT',   True,  'baseline',   True),
            (2,  4,  'blood', 'SST',            '10ML',  'venous',    'SUFFICIENT',   True,  'baseline',   True),
            (3,  2,  'blood', 'EDTA',           '3ML',   'capillary', 'SUFFICIENT',   True,  'screening',  True),
            (3,  6,  'urine', 'URINE_CONTAINER','OTHER', 'venous',    'SUFFICIENT',   True,  'baseline',   True),
            (4,  3,  'blood', 'EDTA',           '6ML',   'venous',    'INSUFFICIENT', True,  'baseline',   False),
            (4,  5,  'blood', 'EDTA',           '6ML',   'venous',    'SUFFICIENT',   True,  'follow_up',  True),
            (5,  1,  'blood', 'SST',            '10ML',  'venous',    'SUFFICIENT',   True,  'screening',  True),
            (6,  2,  'blood', 'SODIUM_CITRATE', '6ML',   'venous',    'SUFFICIENT',   True,  'baseline',   True),
            (7,  4,  'blood', 'EDTA',           '6ML',   'venous',    'SUFFICIENT',   True,  'follow_up',  True),

            # Malaria Study
            (8,  3,  'blood', 'EDTA',           '3ML',   'capillary', 'SUFFICIENT',   True,  'screening',  True),
            (8,  10, 'blood', 'LIHEP',          '6ML',   'venous',    'SUFFICIENT',   True,  'baseline',   True),
            (9,  2,  'blood', 'EDTA',           '6ML',   'venous',    'SUFFICIENT',   True,  'screening',  True),
            (9,  8,  'blood', 'SST',            '10ML',  'venous',    'SUFFICIENT',   True,  'baseline',   True),
            (10, 5,  'blood', 'EDTA',           '6ML',   'venous',    'SUFFICIENT',   True,  'baseline',   True),
            (11, 3,  'blood', 'EDTA',           '3ML',   'capillary', 'SUFFICIENT',   True,  'screening',  True),
            (12, 4,  'blood', 'LIHEP',          '6ML',   'venous',    'SUFFICIENT',   True,  'baseline',   True),
            (13, 2,  'urine', 'URINE_CONTAINER','OTHER', 'venous',    'SUFFICIENT',   True,  'baseline',   True),
            (14, 6,  'blood', 'EDTA',           '6ML',   'venous',    'SUFFICIENT',   True,  'follow_up',  True),

            # TB Prevalence Survey — includes sputum samples
            (15, 3,  'sputum','OTHER',           'OTHER', 'venous',   'SUFFICIENT',   True,  'screening',  True),
            (15, 5,  'blood', 'EDTA',            '6ML',  'venous',   'SUFFICIENT',   True,  'baseline',   True),
            (16, 2,  'sputum','OTHER',            'OTHER','venous',   'SUFFICIENT',   True,  'screening',  True),
            (16, 4,  'blood', 'RED_TOP',          '10ML', 'venous',   'SUFFICIENT',   True,  'baseline',   True),
            (17, 1,  'blood', 'EDTA',             '6ML',  'venous',   'SUFFICIENT',   True,  'screening',  True),
            (18, 3,  'sputum','OTHER',             'OTHER','venous',  'SUFFICIENT',   True,  'baseline',   True),
            (18, 7,  'blood', 'SST',              '10ML', 'venous',   'SUFFICIENT',   True,  'follow_up',  True),
            (19, 2,  'blood', 'BLOOD_CULTURE',    '10ML', 'venous',   'SUFFICIENT',   True,  'screening',  True),
            (19, 5,  'blood', 'EDTA',             '6ML',  'venous',   'SUFFICIENT',   True,  'baseline',   True),
        ]

        phlebotomies = []
        for i, (p_idx, day_offset, s_type, tube, vol, site, notes, consent, visit, collected) in enumerate(records):
            participant = participants[p_idx]
            coll_date   = participant.enrollment_date + timedelta(days=day_offset)
            collector   = collectors[i % len(collectors)]

            reason = 'Patient refused venipuncture at this visit' if not collected else ''

            pb = Phlebotomy.objects.create(
                participant=participant,
                collector_name=collector,
                collection_date=coll_date,
                collection_time=time(8 + (i % 6), (i * 7) % 60),
                sample_type=s_type,
                tube_type=tube,
                volume_collected=vol,
                collection_site=site,
                collection_notes=notes,
                collection_notes_other='',
                consented=consent,
                visit_type=visit,
                sample_collected=collected,
                no_collection_reason=reason,
                created_by=phlebotomist,
            )
            phlebotomies.append(pb)

        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(phlebotomies)} phlebotomy records created.'))
        return phlebotomies

    # ─────────────────────────────────────────────
    # SAMPLE PROCESSING
    # ─────────────────────────────────────────────
    def create_processing(self, phlebotomies, admin):
        self.stdout.write('  Creating sample processing records...')

        lab_tech = User.objects.get(username='lab_tech')

        # Only process records where sample_collected = True
        collected = [p for p in phlebotomies if p.sample_collected]

        technologists = ['JW', 'GM', 'AK', 'MO', 'RN']

        processing_configs = [
            # (proc_type, equipment, tubes_edta, tubes_lihep, tubes_sst, tubes_sc, tubes_bc, tubes_rt, tubes_other, aliquot_prefix)
            ('centrifugation', 'ref_centrifuge',     2, 0, 0, 0, 0, 0, 0, 'CRY'),
            ('centrifugation', 'ref_centrifuge',     0, 0, 1, 0, 0, 0, 0, 'CRY'),
            ('aliquoting',     '',                   1, 0, 0, 0, 0, 0, 0, 'ALQ'),
            ('centrifugation', 'non_ref_centrifuge', 0, 1, 0, 0, 0, 0, 0, 'CRY'),
            ('incubation',     '',                   0, 0, 0, 0, 1, 0, 0, 'INC'),
            ('centrifugation', 'ref_centrifuge',     2, 0, 1, 0, 0, 0, 0, 'CRY'),
            ('aliquoting',     '',                   0, 0, 0, 0, 0, 0, 1, 'SPT'),
            ('centrifugation', 'ref_centrifuge',     1, 0, 0, 0, 0, 0, 0, 'CRY'),
        ]

        dispatched_to = [
            'Dr. Wanjiku — Serology Lab',
            'Prof. Kamau — Virology Unit',
            'Biorepository — Storage Unit A',
            'Dr. Otieno — Haematology Lab',
            'Central Lab — Analysis Dept',
        ]

        processings = []
        for i, phle in enumerate(collected[:25]):  # process up to 25 samples
            cfg = processing_configs[i % len(processing_configs)]
            proc_type, equip, t_edta, t_li, t_sst, t_sc, t_bc, t_rt, t_oth, alq_prefix = cfg

            reception_date = phle.collection_date + timedelta(hours=2)
            acc_num = f'ACC-{phle.collection_date.year}-{str(i+1).zfill(3)}'

            # Skip if already exists
            if SampleProcessing.objects.filter(accession_number=acc_num).exists():
                processings.append(SampleProcessing.objects.get(accession_number=acc_num))
                continue

            # Centrifugation / incubation window
            start_dt = timezone.make_aware(datetime.combine(
                reception_date if isinstance(reception_date, date) else reception_date.date(),
                time(9 + (i % 4), 0)
            ))
            end_dt = start_dt + timedelta(minutes=20 + (i % 15))
            dispatch_dt = end_dt + timedelta(hours=1)

            sp = SampleProcessing.objects.create(
                phlebotomy=phle,
                accession_number=acc_num,
                reception_date=phle.collection_date,
                reception_time=time(9 + (i % 4), (i * 5) % 60),
                tubes_edta=t_edta,
                tubes_lihep=t_li,
                tubes_sst=t_sst,
                tubes_sodium_citrate=t_sc,
                tubes_blood_culture=t_bc,
                tubes_red_top=t_rt,
                tubes_other=t_oth,
                processing_type=proc_type,
                aliquot_number=f'{alq_prefix}-{str(i+1).zfill(4)}',
                technologist_initials=technologists[i % len(technologists)],
                equipment_used=equip,
                centrifugation_start=start_dt if proc_type == 'centrifugation' else None,
                centrifugation_end=end_dt   if proc_type == 'centrifugation' else None,
                incubation_start=start_dt   if proc_type == 'incubation' else None,
                incubation_end=end_dt       if proc_type == 'incubation' else None,
                results_dispatch_time=dispatch_dt,
                results_dispatched_to=dispatched_to[i % len(dispatched_to)],
                created_by=lab_tech,
            )
            processings.append(sp)

        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(processings)} processing records created.'))
        return processings

    # ─────────────────────────────────────────────
    # SAMPLE STORAGE
    # ─────────────────────────────────────────────
    def create_storage(self, processings, admin):
        self.stdout.write('  Creating sample storage records...')

        lab_tech   = User.objects.get(username='lab_tech')

        temperatures = ['-80', '-80', '-20', '2-8', '-80', '-80', '-20', '2-8']
        freezer_map  = {'-80': 'FRZ-A', '-20': 'FRZ-B', '2-8': 'FRD-C'}

        storage_count = 0
        for i, proc in enumerate(processings[:20]):  # store up to 20
            # Skip if already stored (OneToOne)
            if SampleStorage.objects.filter(processing=proc).exists():
                storage_count += 1
                continue

            temp       = temperatures[i % len(temperatures)]
            sample_id  = f'SMP-{str(i+1).zfill(4)}'
            shelf      = f'S{(i % 4) + 1}'
            rack       = f'R{(i % 6) + 1}'
            box        = f'B{(i % 12) + 1}'
            position   = f'{chr(65 + (i % 8))}{(i % 9) + 1}'  # e.g. A1, B3, C7

            # Some samples already retrieved
            retrieved        = i % 5 == 0
            retrieval_dt     = timezone.make_aware(datetime.combine(
                proc.reception_date + timedelta(days=7), time(14, 30)
            )) if retrieved else None
            retrieved_by     = ['Dr. James Waweru', 'Dr. Grace Muthoni', 'Lab Tech Otieno'][i % 3] if retrieved else ''
            retrieval_cond   = 'good' if retrieved else ''
            condition        = 'good' if i % 8 != 3 else 'compromised'

            SampleStorage.objects.create(
                processing=proc,
                sample_id=sample_id,
                freezer_id=freezer_map.get(temp, '') if temp in ['-80', '-20'] else '',
                fridge_id=freezer_map.get(temp, '') if temp == '2-8' else '',
                shelf_number=shelf,
                rack_number=rack,
                box_number=box,
                position=position,
                storage_temperature=temp,
                date_stored=proc.reception_date,
                storage_condition=condition,
                retrieval_datetime=retrieval_dt,
                retrieved_by=retrieved_by,
                retrieval_condition=retrieval_cond,
                created_by=lab_tech,
            )
            storage_count += 1

        self.stdout.write(self.style.SUCCESS(f'  ✓ {storage_count} storage records created.'))

    # ─────────────────────────────────────────────
    # STOCK INVENTORY
    # ─────────────────────────────────────────────
    def create_stock(self, admin):
        self.stdout.write('  Creating stock inventory...')

        store_keeper = User.objects.get(username='store_keeper')
        today        = date.today()

        stock_items = [
            # ── Consumables ──────────────────────────────────────────────────────────
            # (item_id, name, category, supplier, batch, expiry_offset_days, qty, unit, location, condition)
            ('STK-001', 'EDTA Tubes 6mL',                 'consumable', 'BD Vacutainer Kenya',     'BDV-2024-A1',  540,  500,  'pieces', 'main_store',         'good'),
            ('STK-002', 'SST Tubes 10mL',                 'consumable', 'BD Vacutainer Kenya',     'BDV-2024-B2',   90,    8,  'pieces', 'main_store',         'good'),    # low stock
            ('STK-003', 'Li-Hep Tubes 6mL',               'consumable', 'BD Vacutainer Kenya',     'BDV-2024-C3',  365,  250,  'pieces', 'main_store',         'good'),
            ('STK-004', 'Sodium Citrate Tubes 2.7mL',     'consumable', 'Greiner Bio-One',         'GBO-2024-D4',  400,   80,  'pieces', 'main_store',         'good'),
            ('STK-005', 'Blood Culture Bottles (Aerobic)', 'consumable', 'bioMérieux Kenya',        'BMX-2024-E5',  300,   30,  'pieces', 'departmental_store', 'good'),
            ('STK-006', 'Red Top Tubes 10mL',             'consumable', 'BD Vacutainer Kenya',     'BDV-2024-F6',  500,  150,  'pieces', 'main_store',         'good'),
            ('STK-007', 'Urine Containers 60mL',          'consumable', 'Sarstedt AG',             'SAR-2024-G7',  720,  400,  'pieces', 'main_store',         'good'),
            ('STK-008', 'Cryovials 2mL',                  'consumable', 'Nunc Thermo Scientific',  'NTS-2024-H8',  900, 1000,  'pieces', 'main_store',         'good'),
            ('STK-009', 'Needles 21G',                    'consumable', 'Terumo Corporation',      'TER-2024-I9',  365,    5,  'boxes',  'departmental_store', 'good'),    # low stock
            ('STK-010', 'Gloves Nitrile Medium',          'consumable', 'Ansell Healthcare',       'ANS-2024-J10', 365,   25,  'boxes',  'main_store',         'good'),
            ('STK-011', 'Alcohol Swabs',                  'consumable', 'Cardinal Health',         'CAH-2024-K11', 180,   10,  'boxes',  'departmental_store', 'good'),    # low stock

            # ── Reagents ─────────────────────────────────────────────────────────────
            ('STK-012', 'Phosphate Buffer Saline (PBS)',   'reagent',    'Sigma-Aldrich Kenya',     'SAL-2024-L12',  25,  20,  'liters', 'departmental_store', 'good'),    # expiring soon
            ('STK-013', 'RPMI 1640 Medium',               'reagent',    'Gibco Life Technologies', 'GLT-2024-M13', 180, 15,   'liters', 'departmental_store', 'good'),
            ('STK-014', 'Ficoll-Paque PLUS',              'reagent',    'Cytiva/GE Healthcare',    'CGH-2024-N14',  20,  4,   'liters', 'departmental_store', 'good'),    # expiring soon + low
            ('STK-015', 'Fetal Bovine Serum (FBS)',       'reagent',    'Sigma-Aldrich Kenya',     'SAL-2024-O15', 365, 12,   'liters', 'main_store',         'good'),
            ('STK-016', 'DMSO (Dimethyl sulfoxide)',       'reagent',    'Merck KGaA',              'MRK-2024-P16', 730, 5,   'liters', 'main_store',         'good'),    # low stock
            ('STK-017', 'Trypan Blue Solution 0.4%',      'reagent',    'Sigma-Aldrich Kenya',     'SAL-2024-Q17', 540, 10,  'liters', 'departmental_store', 'good'),
            ('STK-018', 'Ethanol 70% (Lab Grade)',        'reagent',    'ATICA Chemicals',         'ATC-2024-R18',  90, 50,  'liters', 'main_store',         'good'),    # expiring soon
            ('STK-019', 'Sodium Hypochlorite 10%',        'reagent',    'Diversey Kenya',          'DIV-2024-S19', 180, 30,  'liters', 'main_store',         'good'),
            ('STK-020', 'Wright-Giemsa Stain',            'reagent',    'Merck KGaA',              'MRK-2024-T20', -15,  6,  'liters', 'quarantine_store',   'expired'), # already expired
        ]

        count = 0
        for item_id, name, cat, supplier, batch, expiry_offset, qty, unit, location, condition in stock_items:
            if StockItem.objects.filter(item_id=item_id).exists():
                count += 1
                continue

            expiry = today + timedelta(days=expiry_offset)
            rej_reason = 'Item found expired upon delivery. Retained for documentation.' if condition == 'expired' else ''

            StockItem.objects.create(
                item_id=item_id,
                item_name=name,
                category=cat,
                supplier=supplier,
                batch_number=batch,
                expiry_date=expiry,
                quantity_available=qty,
                unit=unit,
                storage_location=location,
                condition_received=condition,
                rejection_reason=rej_reason,
                received_by=f'{store_keeper.first_name} {store_keeper.last_name}',
                reception_date=today - timedelta(days=30),
                created_by=store_keeper,
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} stock items created.'))
        self.stdout.write('')
        self.stdout.write('  Stock summary:')
        self.stdout.write(f'    Total items    : {StockItem.objects.count()}')
        self.stdout.write(f'    Low stock (≤10): {StockItem.objects.filter(quantity_available__lte=10).count()}')
        exp_count = StockItem.objects.filter(expiry_date__lt=today).count()
        soon_count = StockItem.objects.filter(
            expiry_date__gte=today,
            expiry_date__lte=today + timedelta(days=30)
        ).count()
        self.stdout.write(f'    Expired        : {exp_count}')
        self.stdout.write(f'    Expiring soon  : {soon_count}')