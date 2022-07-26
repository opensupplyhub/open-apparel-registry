"""oar URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.urls import path, include

from api import views
from api.admin import admin_site
from web.views import environment

from rest_framework import routers, permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from oar import settings


router = routers.DefaultRouter()
router.register('facility-lists', views.FacilityListViewSet, 'facility-list')
router.register('facilities', views.FacilitiesViewSet, 'facility')
router.register('facility-claims', views.FacilityClaimViewSet,
                'facility-claim')
router.register('facility-matches', views.FacilityMatchViewSet,
                'facility-match')
router.register('api-blocks', views.ApiBlockViewSet, 'api-block')
router.register('contributor-webhooks', views.ContributorWebhookViewSet,
                'contributor-webhooks')
router.register('facility-activity-reports',
                views.FacilityActivityReportViewSet,
                'facility-activity-report')
router.register('embed-configs', views.EmbedConfigViewSet, 'embed-config')
router.register('nonstandard-fields', views.NonstandardFieldsViewSet,
                'nonstandard-fields')
router.register('facilities-downloads', views.FacilitiesDownloadViewSet,
                'facilities-downloads')

public_apis = [
    path('api/', include(router.urls)),
    path('api/contributors/active_count/', views.active_contributors_count,
         name='active_contributors_count'),
    path('api/contributors/', views.all_contributors,
         name='all_contributors'),
    path('api/contributor-embed-configs/<int:pk>/',
         views.contributor_embed_config, name='contributor-embed-config'),
    path('api/contributor-types/', views.all_contributor_types,
         name='all_contributor_types'),
    path('api/countries/active_count/', views.active_countries_count,
         name='active_countries_count'),
    path('api/countries/', views.all_countries, name='all_countries'),
    path('api/contributor-lists/',
         views.ContributorFacilityListViewSet.as_view({'get': 'list'}),
         name='contributor_lists'),
    path('api/log-download/', views.log_download, name='log_download'),
    path('api/workers-ranges/', views.number_of_workers_ranges,
         name='number_of_workers_ranges'),
    path('api/facility-processing-types/', views.facility_processing_types,
         name='facility_processing_types'),
    path('api/parent-companies/', views.parent_companies,
         name='parent_companies'),
    path('api/product-types/', views.product_types, name='product_types'),
    path('api/sectors/', views.sectors, name='sectors'),
]

schema_view = get_schema_view(
    openapi.Info(
        title='Open Supply Hub API',
        default_version='1',
        description='Open Supply Hub API',
        terms_of_service="https://info.openapparel.org/terms-of-service",
        license=openapi.License(name='MIT', url='https://github.com/open-apparel-registry/open-apparel-registry/blob/develop/LICENSE')  # NOQA
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    patterns=[path("", include(public_apis))],
)

info_apis = [
    path('api/info/contributors/', views.active_contributors_count,
         name='active_contributors_count'),
    path('api/info/countries/', views.active_countries_count,
         name='active_countries_count'),
    path('api/info/facilities/',
         views.FacilitiesViewSet.as_view({'get': 'count'}),
         name='facilities_count'),
]

internal_apis = [
    path('', include('django.contrib.auth.urls')),
    path('web/environment.js', environment, name='environment'),
    path('api/docs/', schema_view.with_ui('swagger'),
         name='schema-swagger-ui'),
    path('admin/', admin_site.urls),
    path('health-check/', include('watchman.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('rest-auth/', include('rest_auth.urls')),
    path('rest-auth/registration/', include('rest_auth.registration.urls')),
    path('user-login/', views.LoginToOARClient.as_view(),
         name='login_to_oar_client'),
    path('user-logout/', views.LogoutOfOARClient.as_view(),
         name='logout_of_oar_client'),
    path('user-signup/', views.SubmitNewUserForm.as_view(),
         name='submit_new_user_form'),
    path('user-profile/<int:pk>/', views.UserProfile.as_view(),
         name='get_and_update_user_profile'),
    path('api-token-auth/', views.APIAuthToken.as_view(),
         name='api_token_auth'),
    path('api-feature-flags/', views.api_feature_flags,
         name='api_feature_flags'),
    path('tile/<layer>/<cachekey>/<int:z>/<int:x>/<int:y>.<ext>',
         views.get_tile, name='tile'),
    path('api/current_tile_cache_key/', views.current_tile_cache_key),
    path('api-blocks/', views.ApiBlockViewSet, 'api-block'),
    path('api/geocoder/', views.get_geocoding, name='get_geocoding'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns = public_apis + internal_apis + info_apis
