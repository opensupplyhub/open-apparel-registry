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
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf.urls import url

from api import views
from web.views import index


from rest_framework import routers

from oar import settings

router = routers.DefaultRouter()
router.register('facility-lists', views.FacilityListViewSet, 'facility-list')
router.register('facilities', views.FacilitiesViewSet, 'facility')

handler404 = 'web.views.handler404'

urlpatterns = [
    url(r'^$', index),
    url(r'^api/', include(router.urls)),
    path('admin/', admin.site.urls),
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
    url(r'^api-token-auth/', views.APIAuthToken.as_view(),
        name='api_token_auth'),
    url(r'^token-auth-example/', views.token_auth_example,
        name='token_auth_example'),
    url(r'^api/contributors/', views.all_contributors,
        name='all_contributors'),
    url(r'^api/contributor-types/', views.all_contributor_types,
        name='all_contributor_types'),
    url(r'^api/countries/', views.all_countries, name='all_countries'),
    # TODO: Remove the following URLs once the Django versions have been
    # implemented. These are here as imitations of the URLs available via
    # the legacy Restify API:
    url(r'getList/', views.get_list, name='get_list'),
    url(r'confirmTemp/', views.confirm_temp, name='confirm_temp'),
    url(r'updateSourceName/', views.update_source_name,
        name='update_source_name'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
