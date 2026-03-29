# core/management/commands/seed_date_updates.py

import random
from datetime import date, timedelta, datetime, time
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction


def rand_date(start: date, end: date) -> date:
    """Return a random date between start and end (inclusive)."""
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def rand_datetime(start: date, end: date) -> datetime:
    """Return a timezone-aware datetime between start 00:00 and end 23:59."""
    d = rand_date(start, end)
    t = time(
        hour=random.randint(7, 17),
        minute=random.randint(0, 59),
        second=random.randint(0, 59),
    )
    naive = datetime.combine(d, t)
    return timezone.make_aware(naive)


def rand_time(hour_start=7, hour_end=17) -> time:
    return time(
        hour=random.randint(hour_start, hour_end),
        minute=random.randint(0, 59),
        second=random.randint(0, 59),
    )


class Command(BaseCommand):
    help = (
        "Update existing records with realistic recent dates "
        "(4 days ago → 1 month ago) for collection, processing, storage and audit timestamps."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print what would change without saving to the database.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        today      = date.today()
        end_date   = today - timedelta(days=4)    # most recent allowed: 4 days ago
        start_date = today - timedelta(days=30)   # oldest allowed:      30 days ago

        if dry_run:
            self.stdout.write(self.style.WARNING('=== DRY RUN — no changes will be saved ==='))

        self.stdout.write(
            f"Date window:  {start_date}  →  {end_date}  "
            f"(today is {today})"
        )

        with transaction.atomic():
            self._update_participants(start_date, end_date, dry_run)
            self._update_phlebotomies(start_date, end_date, dry_run)
            self._update_processings(start_date, end_date, dry_run)
            self._update_storages(start_date, end_date, dry_run)
            self._update_stock_items(start_date, end_date, dry_run)
            self._update_audit_logs(start_date, end_date, dry_run)

            if dry_run:
                # Roll back everything so nothing actually changes
                transaction.set_rollback(True)
                self.stdout.write(self.style.WARNING('Dry run complete — rolled back all changes.'))
            else:
                self.stdout.write(self.style.SUCCESS('All dates updated successfully.'))

    # ── Participants ──────────────────────────────────────────────────────────
    def _update_participants(self, start: date, end: date, dry_run: bool):
        from core.models import Participant

        qs = Participant.objects.all()
        count = qs.count()
        if not count:
            self.stdout.write('  Participants: 0 records — skipped.')
            return

        updated = 0
        for p in qs:
            enrollment = rand_date(start, end)
            created_at  = rand_datetime(start, end)

            if not dry_run:
                Participant.objects.filter(pk=p.pk).update(
                    enrollment_date=enrollment,
                    created_at=created_at,
                    updated_at=created_at,
                )
            updated += 1

        self.stdout.write(f'  Participants   : {updated}/{count} updated  '
                          f'(enrollment_date, created_at, updated_at)')

    # ── Phlebotomies ─────────────────────────────────────────────────────────
    def _update_phlebotomies(self, start: date, end: date, dry_run: bool):
        from core.models import Phlebotomy

        qs = Phlebotomy.objects.all()
        count = qs.count()
        if not count:
            self.stdout.write('  Phlebotomies: 0 records — skipped.')
            return

        updated = 0
        for ph in qs:
            coll_date   = rand_date(start, end)
            coll_time   = rand_time(7, 12)          # collections typically morning
            created_at  = rand_datetime(start, end)

            if not dry_run:
                Phlebotomy.objects.filter(pk=ph.pk).update(
                    collection_date=coll_date,
                    collection_time=coll_time,
                    created_at=created_at,
                    updated_at=created_at,
                )
            updated += 1

        self.stdout.write(f'  Phlebotomies   : {updated}/{count} updated  '
                          f'(collection_date, collection_time, created_at, updated_at)')

    # ── Sample Processing ────────────────────────────────────────────────────
    def _update_processings(self, start: date, end: date, dry_run: bool):
        from core.models import SampleProcessing

        qs = SampleProcessing.objects.all()
        count = qs.count()
        if not count:
            self.stdout.write('  SampleProcessing: 0 records — skipped.')
            return

        updated = 0
        for sp in qs:
            recv_date  = rand_date(start, end)
            recv_time  = rand_time(8, 14)

            # centrifugation window: starts ~30 min after reception
            recv_dt    = timezone.make_aware(datetime.combine(recv_date, recv_time))
            cent_start = recv_dt + timedelta(minutes=random.randint(15, 45))
            cent_end   = cent_start + timedelta(minutes=random.randint(10, 30))

            # incubation window: starts after centrifugation
            inc_start  = cent_end + timedelta(minutes=random.randint(5, 20))
            inc_end    = inc_start + timedelta(hours=random.randint(1, 4))

            dispatch_dt = inc_end + timedelta(minutes=random.randint(10, 60))

            created_at = recv_dt

            if not dry_run:
                SampleProcessing.objects.filter(pk=sp.pk).update(
                    reception_date=recv_date,
                    reception_time=recv_time,
                    centrifugation_start=cent_start,
                    centrifugation_end=cent_end,
                    incubation_start=inc_start,
                    incubation_end=inc_end,
                    results_dispatch_time=dispatch_dt,
                    created_at=created_at,
                    updated_at=created_at,
                )
            updated += 1

        self.stdout.write(f'  SampleProcessing: {updated}/{count} updated  '
                          f'(reception, centrifugation, incubation, dispatch, created_at)')

    # ── Sample Storage ───────────────────────────────────────────────────────
    def _update_storages(self, start: date, end: date, dry_run: bool):
        from core.models import SampleStorage

        qs = SampleStorage.objects.all()
        count = qs.count()
        if not count:
            self.stdout.write('  SampleStorage: 0 records — skipped.')
            return

        updated = 0
        for ss in qs:
            stored_date = rand_date(start, end)
            created_at  = rand_datetime(start, end)

            # ~30 % of samples have a retrieval date after storage
            retrieval_dt = None
            if random.random() < 0.3:
                ret_date     = rand_date(stored_date, end)
                retrieval_dt = rand_datetime(ret_date, end)

            if not dry_run:
                SampleStorage.objects.filter(pk=ss.pk).update(
                    date_stored=stored_date,
                    retrieval_datetime=retrieval_dt,
                    created_at=created_at,
                    updated_at=created_at,
                )
            updated += 1

        self.stdout.write(f'  SampleStorage   : {updated}/{count} updated  '
                          f'(date_stored, retrieval_datetime, created_at)')

    # ── Stock Items ──────────────────────────────────────────────────────────
    def _update_stock_items(self, start: date, end: date, dry_run: bool):
        from core.models import StockItem

        qs = StockItem.objects.all()
        count = qs.count()
        if not count:
            self.stdout.write('  StockItems: 0 records — skipped.')
            return

        today = date.today()
        updated = 0
        for si in qs:
            recv_date  = rand_date(start, end)
            created_at = rand_datetime(start, end)

            # Expiry: mix of already expired, expiring-soon, and fresh
            roll = random.random()
            if roll < 0.10:
                # ~10 % already expired (1–15 days ago)
                expiry = today - timedelta(days=random.randint(1, 15))
            elif roll < 0.25:
                # ~15 % expiring within 30 days
                expiry = today + timedelta(days=random.randint(1, 30))
            else:
                # remaining: fresh (31 days – 2 years)
                expiry = today + timedelta(days=random.randint(31, 730))

            if not dry_run:
                StockItem.objects.filter(pk=si.pk).update(
                    reception_date=recv_date,
                    expiry_date=expiry,
                    created_at=created_at,
                    last_updated=created_at,
                )
            updated += 1

        self.stdout.write(f'  StockItems      : {updated}/{count} updated  '
                          f'(reception_date, expiry_date, created_at, last_updated)')

    # ── Audit Logs ───────────────────────────────────────────────────────────
    def _update_audit_logs(self, start: date, end: date, dry_run: bool):
        from core.models import AuditLog

        qs = AuditLog.objects.all()
        count = qs.count()
        if not count:
            self.stdout.write('  AuditLog: 0 records — skipped.')
            return

        updated = 0
        for log in qs:
            ts = rand_datetime(start, end)

            if not dry_run:
                AuditLog.objects.filter(pk=log.pk).update(timestamp=ts)
            updated += 1

        self.stdout.write(f'  AuditLogs       : {updated}/{count} updated  '
                          f'(timestamp)')