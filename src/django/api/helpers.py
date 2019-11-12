import re

CONSONANT_SOUND = re.compile(r'''
one(![ir])
''', re.IGNORECASE | re.VERBOSE)

VOWEL_SOUND = re.compile(r'''
[aeio]|
u([aeiou]|[^n][^aeiou]|ni[^dmnl]|nil[^l])|
h(ier|onest|onou?r|ors\b|our(!i))|
[fhlmnrsx]\b
''', re.IGNORECASE | re.VERBOSE)


def prefix_a_an(value):
    """
    Return a string prefixed with "a" or "an" as appropriate.
    Based on https://djangosnippets.org/snippets/1519/
    """
    if not CONSONANT_SOUND.match(value) and VOWEL_SOUND.match(value):
        return 'An {}'.format(value)
    return 'A {}'.format(value)
