from rest_framework.pagination import PageNumberPagination


class PageAndSizePagination(PageNumberPagination):
    page_query_param = 'page'
    page_size_query_param = 'pageSize'
    max_page_size = 100
