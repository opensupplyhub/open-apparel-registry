from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


# TODO: Remove the following URLS once Django versions have been
# implemented. These are here as imitations of the URLS available via
# the legacy Restify API.
@api_view(['GET'])
@permission_classes((AllowAny,))
def get_lists(request):
    return Response({"lists": []})


@api_view(['GET'])
@permission_classes((AllowAny,))
def get_list(request):
    return Response({"temps": []})


@api_view(['GET'])
@permission_classes((AllowAny,))
def confirm_temp(request):
    return Response({"temp": None})


@api_view(['POST'])
@permission_classes((AllowAny,))
def update_source_name(request):
    return Response({"source": None})


@api_view(['POST'])
@permission_classes((AllowAny,))
def upload_temp_factory(request):
    return Response("0 TEMP factories have been successfully uploaded")


@api_view(['GET'])
@permission_classes((AllowAny,))
def generate_key(request):
    return Response({"key": "key"})


@api_view(['GET'])
@permission_classes((AllowAny,))
def all_source(request):
    return Response({"sources": []})


@api_view(['GET'])
@permission_classes((AllowAny,))
def all_country(request):
    return Response({"countries": []})


@api_view(['GET'])
@permission_classes((AllowAny,))
def total_factories(request):
    return Response({"total": 0})


@api_view(['GET'])
@permission_classes((AllowAny,))
def search_factories(request):
    return Response([])
