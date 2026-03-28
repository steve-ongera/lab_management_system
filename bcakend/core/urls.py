from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('participants', views.ParticipantViewSet)
router.register('phlebotomy', views.PhlebotomyViewSet)
router.register('processing', views.SampleProcessingViewSet)
router.register('storage', views.SampleStorageViewSet)
router.register('stock', views.StockItemViewSet)
router.register('audit-logs', views.AuditLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_view),
    path('auth/logout/', views.logout_view),
    path('auth/me/', views.me_view),
    path('dashboard/stats/', views.dashboard_stats),
]