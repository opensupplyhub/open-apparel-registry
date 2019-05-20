from rest_framework.pagination import PageNumberPagination
from rest_framework_gis.pagination import GeoJsonPagination


class PageAndSizePagination(PageNumberPagination):
    page_query_param = 'page'
    page_size_query_param = 'pageSize'
    max_page_size = 100


class FacilitiesGeoJSONPagination(GeoJsonPagination):
    page_query_param = 'page'
    page_size_query_param = 'pageSize'
    page_size = 500
    max_page_size = 500
