from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from api import models

admin.site.register(models.User, UserAdmin)
admin.site.register(models.Organization)
admin.site.register(models.FacilityList)
admin.site.register(models.FacilityListItem)
admin.site.register(models.Facility)
admin.site.register(models.FacilityMatch)
