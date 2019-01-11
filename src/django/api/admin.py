from django.contrib import admin

from api import models

admin.site.register(models.User)
admin.site.register(models.Organization)
admin.site.register(models.FacilityList)
admin.site.register(models.FacilityListItem)
admin.site.register(models.Facility)
admin.site.register(models.FacilityMatch)
