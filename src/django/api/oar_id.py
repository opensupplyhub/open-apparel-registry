import base32_crockford
import random

from django.utils import timezone

from api.countries import COUNTRY_NAMES


def checksum(short_id):
    """
    Given an OAR ID string without the final digit, calculate and return the
    final checksum digit.
    """
    country_val = ord(short_id[0]) + ord(short_id[1])
    rest_val = sum([base32_crockford.symbols.index(x) for x in short_id[2:]])
    return base32_crockford.symbols[(country_val + rest_val) % 32]


def random_base_32_string(length):
    """
    Return a random number encoded as a zero-padded base 32 string of the
    specified length.
    """
    maximum = pow(32, length) - 1
    return base32_crockford.encode(random.randint(0, maximum)).zfill(length)


def make_oar_id(country_code, hyphenate=False):
    """
    Return a new, semi-random OAR ID string with the following schema

    country code    day of creation   random base32 string   check digit
    |                      |                    |                  |
    |      ----------------                     |                  |
    |     |        -----------------------------                   |
    |     |       |   ---------------------------------------------
    |     |       |  |
    IN 2019067 X1K87 E

    The `country_code` must be a valid ISO 3166-1 alpha-2 code in upper case.

    If `hyphenate` is True, hyphens will be inserted between the individual
    tokens within the ID.
    """
    if country_code not in COUNTRY_NAMES:
        raise ValueError(
            '{0} is not a known country code'.format(country_code))
    now = timezone.now().timetuple()
    day = str(now.tm_year) + str(now.tm_yday).zfill(3)
    r = random_base_32_string(5)
    short_id = country_code + day + r
    if hyphenate:
        separator = '-'
    else:
        separator = ''
    return separator.join([country_code, day, r, checksum(short_id)])


def validate_oar_id(raw_id, raise_on_invalid=True):
    """
    Verify that the specified OAR ID has the proper length and that the
    checksum digit matches the computed value of the rest of the digits.
    Returns True if the specified OAR ID is valid. Either returns False or
    raises an error when the specified OAR ID is invalid, depending on the
    value of the `raise_on_invalid` argument.
    Any spaces or hyphens present in the string are removed before validation.
    """
    id = raw_id.replace('-', '').replace(' ', '')
    if len(id) != 15:
        if raise_on_invalid:
            raise ValueError('Not 15 characters')
        else:
            return False
    if checksum(id[:len(id)-1]) != id[-1]:
        if raise_on_invalid:
            raise ValueError('Checksum invalid')
        else:
            return False
    return True
