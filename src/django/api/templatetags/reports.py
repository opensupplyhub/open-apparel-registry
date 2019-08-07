from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()


@register.filter
@stringfilter
def pretty_report_name(value):
    return value.replace('_', ' ').replace('-', ' ').title()
