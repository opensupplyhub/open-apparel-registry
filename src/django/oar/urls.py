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
from django.urls import path, re_path, include
from django.conf.urls import url

from api import views
from api.admin import admin_site
from web.views import environment

from rest_framework import routers
from rest_framework_swagger.views import get_swagger_view

from oar import settings


router = routers.DefaultRouter()
router.register('facility-lists', views.FacilityListViewSet, 'facility-list')
router.register('facilities', views.FacilitiesViewSet, 'facility')
router.register('facility-claims', views.FacilityClaimViewSet,
                'facility-claim')
router.register('facility-matches', views.FacilityMatchViewSet,
                'facility-match')
router.register('api-blocks', views.ApiBlockViewSet, 'api-block')
router.register('facility-activity-reports',
                views.FacilityActivityReportViewSet,
                'facility-activity-report')
router.register('embed-configs', views.EmbedConfigViewSet, 'embed-config')
router.register('nonstandard-fields', views.NonstandardFieldsViewSet,
                'nonstandard-fields')

public_apis = [
    url(r'^api/', include(router.urls)),
    url(r'^api/contributors/active_count', views.active_contributors_count,
        name='active_contributors_count'),
    url(r'^api/contributors/', views.all_contributors,
        name='all_contributors'),
    url(r'^api/contributor-embed-configs/(?P<pk>\d+)/$',
        views.contributor_embed_config, name='contributor-embed-config'),
    url(r'^api/contributor-types/', views.all_contributor_types,
        name='all_contributor_types'),
    url(r'^api/countries/active_count', views.active_countries_count,
        name='active_countries_count'),
    url(r'^api/countries/', views.all_countries, name='all_countries'),
    url(r'^api/contributor-lists/',
        views.ContributorFacilityListViewSet.as_view({'get': 'list'}),
        name='contributor_lists'),
    url(r'^api/workers-ranges/', views.number_of_workers_ranges,
        name='number_of_workers_ranges'),
    url(r'^api/facility-processing-types', views.facility_processing_types,
        name='facility_processing_types'),
    url(r'^api/product-types', views.product_types,
        name='prodcut_types'),
]

info_apis = [
    url(r'^api/info/contributors/', views.active_contributors_count,
        name='active_contributors_count'),
    url(r'^api/info/countries/', views.active_countries_count,
        name='active_countries_count'),
    url(r'^api/info/facilities/',
        views.FacilitiesViewSet.as_view({'get': 'count'}),
        name='facilities_count'),
]

schema_view = get_swagger_view(title='Open Apparel Registry API Documentation',
                               patterns=public_apis)

internal_apis = [
    url(r'^', include('django.contrib.auth.urls')),
    url(r'^web/environment\.js', environment, name='environment'),
    url(r'^api/docs/', views.schema_view),
    path('admin/', admin_site.urls),
    re_path(r'^health-check/', include('watchman.urls')),
    url(r'^api-auth/', include('rest_framework.urls')),
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^rest-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^user-login/', views.LoginToOARClient.as_view(),
        name='login_to_oar_client'),
    url(r'^user-logout/', views.LogoutOfOARClient.as_view(),
        name='logout_of_oar_client'),
    url(r'^user-signup/', views.SubmitNewUserForm.as_view(),
        name='submit_new_user_form'),
    url(r'^user-profile/(?P<pk>\d+)/$', views.UserProfile.as_view(),
        name='get_and_update_user_profile'),
    url(r'^api-token-auth/', views.APIAuthToken.as_view(),
        name='api_token_auth'),
    url(r'^api-feature-flags', views.api_feature_flags,
        name='api_feature_flags'),
    path(r'tile/<layer>/<cachekey>/<int:z>/<int:x>/<int:y>.<ext>',
         views.get_tile, name='tile'),
    url(r'^api/current_tile_cache_key', views.current_tile_cache_key),
    url(r'api-blocks', views.ApiBlockViewSet, 'api-block'),
    url(r'^api/geocoder/', views.get_geocoding, name='get_geocoding'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns = public_apis + internal_apis + info_apis
