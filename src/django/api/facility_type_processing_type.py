import warnings
warnings.filterwarnings("ignore", message="Using slow pure-python SequenceMatcher. Install python-Levenshtein to remove this warning")

from api.helpers import clean
from thefuzz import process

HEADQUARTERS = 'headquarters'
NO_PROCESSING = 'no processing'
OFFICE = 'office'
OFFICE_HQ = 'office hq'
SOURCING_AGENT = 'sourcing agent'
TRADING = 'trading'

OFFICE_PROCESSING_TYPES = {
    HEADQUARTERS: 'Headquarters',
    NO_PROCESSING: 'No processing',
    OFFICE: 'Office',
    OFFICE_HQ: 'Office / HQ',
    SOURCING_AGENT: 'Sourcing Agent',
    TRADING: 'Trading',
}

OFFICE_PROCESSING_TYPES_ALIAS = {
    'hq': OFFICE_HQ,
    'sourcing': SOURCING_AGENT,
}

PACKING = 'packing'
WAREHOUSING_DISTRIBUTION = 'warehousing distribution'

WAREHOUSING_PROCESSING_TYPES = {
    PACKING: 'Packing',
    WAREHOUSING_DISTRIBUTION: 'Warehousing / Distribution',
}

WAREHOUSING_PROCESSING_TYPES_ALIAS = {
    'warehousing': WAREHOUSING_DISTRIBUTION,
    'distribution': WAREHOUSING_DISTRIBUTION,
    'warehouse': WAREHOUSING_DISTRIBUTION
}

ASSEMBLY = 'assembly'
CUTTING = 'cutting'
CUT_AND_SEW = 'cut & sew'
EMBELLISHMENT = 'embellishment'
EMBROIDERY = 'embroidery'
FINAL_PRODUCT_ASSEMBLY = 'final product assembly'
FINISHED_GOODS = 'finished goods'
IRONING = 'ironing'
KNITWEAR_ASSEMBLY = 'knitwear assembly'
KNIT_COMPOSITE = 'knit composite'
LINKING = 'linking'
MANUFACTURING = 'manufacturing'
MAKING_UP = 'making up'
MARKER_MAKING = 'marker making'
MOLDING = 'molding'
PACKAGING = 'packaging'
PATTERN_GRADING = 'pattern grading'
PLEATING = 'pleating'
PRODUCT_FINISHING = 'product finishing'
READY_MADE_GARMENT = 'ready made garment'
SAMPLE_MAKING = 'sample making'
SEAM_TAPING = 'seam taping'
SEWING = 'sewing'
STEAMING = 'steaming'
STITCHING = 'stitching'
TAILORING = 'tailoring'

ASSEMBLY_PROCESSING_TYPES = {
    ASSEMBLY: 'Assembly',
    CUTTING: 'Cutting',
    CUT_AND_SEW: 'Cut & Sew',
    EMBELLISHMENT: 'Embellishment',
    EMBROIDERY: 'Embroidery',
    FINAL_PRODUCT_ASSEMBLY: 'Final Product Assembly',
    FINISHED_GOODS: 'Finished Goods',
    IRONING: 'Ironing',
    KNITWEAR_ASSEMBLY: 'Knitwear Assembly',
    KNIT_COMPOSITE: 'Knit Composite',
    LINKING: 'Linking',
    MANUFACTURING: 'Manufacturing',
    MAKING_UP: 'Making up',
    MARKER_MAKING: 'Marker Making',
    MOLDING: 'Molding',
    PACKAGING: 'Packaging',
    PATTERN_GRADING: 'Pattern Grading',
    PLEATING: 'Pleating',
    PRODUCT_FINISHING: 'Product Finishing',
    READY_MADE_GARMENT: 'Ready Made Garment',
    SAMPLE_MAKING: 'Sample Making',
    SEAM_TAPING: 'Seam taping',
    SEWING: 'Sewing',
    STEAMING: 'Steaming',
    STITCHING: 'Stitching',
    TAILORING: 'Tailoring',
}

ASSEMBLY_PROCESSING_TYPES_ALIAS = {
    'final product': FINAL_PRODUCT_ASSEMBLY,
    'final assembly': FINAL_PRODUCT_ASSEMBLY,
    'product assembly': FINAL_PRODUCT_ASSEMBLY,
    'knitwear': KNITWEAR_ASSEMBLY,
    'ready made': READY_MADE_GARMENT,
    'ready garment': READY_MADE_GARMENT,
    'taping': SEAM_TAPING,
}

BATCH_DYEING = 'batch dyeing'
COATING = 'coating'
CONTINUOUS_DYEING = 'continuous dyeing'
DIRECT_DIGITAL_INK_PRINTING = 'direct digital ink printing'
DYEING = 'dyeing'
FABRIC_ALL_OVER_PRINT = 'fabric all over print'
FABRIC_CHEMICAL_FINISHING = 'fabric chemical finishing'
FINISHING = 'finishing'
FIBER_DYE = 'fiber dye'
FLAT_SCREEN_PRINTING = 'flat screen printing'
GARMENT_DYEING = 'garment dyeing'
GARMENT_PLACE_PRINT = 'garment place print'
GARMENT_WASH = 'garment wash'
GARMENT_FINISHING = 'garment finishing'
HAND_DYE = 'hand dye'
LAUNDERING = 'laundering'
LAUNDRY = 'laundry'
PRE_TREATMENT = 'pre treatment'
PRINTING = 'printing'
PRINTING_PRODUCT_DYEING_AND_LAUNDERING = ('printing product dyeing '
                                          'and laundering')
PRODDUCT_DYEING = 'product dyeing'
ROTARY_PRINTING = 'rotary printing'
SCREEN_PRINTING = 'screen printing'
SPRAY_DYE = 'spray dye'
SUBLIMATION = 'sublimation'
TEXTILE_DYEING = 'textile dyeing'
TEXTILE_PRINTING = 'textile printing'
TEXTILE_CHEMICAL_FINISHING = 'textile chemical finishing'
TEXTILE_MECHANICAL_FINISHING = 'textile mechanical finishing'
TYE_DYE = 'tye dye'
WASHING = 'washing'
WET_PROCESSING = 'wet processing'
WET_ROLLER_PRINTING = 'wet roller printing'
YARN_DYEING = 'yarn dyeing'

PRINTING_PROCESSING_TYPES = {
    BATCH_DYEING: 'Batch Dyeing',
    COATING: 'Coating',
    CONTINUOUS_DYEING: 'Continuous dyeing',
    DIRECT_DIGITAL_INK_PRINTING: 'Direct Digital Ink Printing',
    DYEING: 'Dyeing',
    FABRIC_ALL_OVER_PRINT: 'Fabric All Over Print',
    FABRIC_CHEMICAL_FINISHING: 'Fabric Chemical Finishing',
    FINISHING: 'Finishing',
    FIBER_DYE: 'Fiber Dye',
    FLAT_SCREEN_PRINTING: 'Flat Screen Printing',
    GARMENT_DYEING: 'Garment Dyeing',
    GARMENT_PLACE_PRINT: 'Garment Place Print',
    GARMENT_WASH: 'Garment Wash',
    GARMENT_FINISHING: 'Garment Finishing',
    HAND_DYE: 'Hand Dye',
    LAUNDERING: 'Laundering',
    LAUNDRY: 'Laundry',
    PRE_TREATMENT: 'Pre-treatment',
    PRINTING: 'Printing',
    PRINTING_PRODUCT_DYEING_AND_LAUNDERING: ('Printing, Product Dyeing '
                                             'and Laundering'),
    PRODDUCT_DYEING: 'Product Dyeing',
    ROTARY_PRINTING: 'Rotary Printing',
    SCREEN_PRINTING: 'Screen Printing',
    SPRAY_DYE: 'Spray Dye',
    SUBLIMATION: 'Sublimation',
    TEXTILE_DYEING: 'Textile Dyeing',
    TEXTILE_PRINTING: 'Textile Printing',
    TEXTILE_CHEMICAL_FINISHING: 'Textile Chemical Finishing',
    TEXTILE_MECHANICAL_FINISHING: 'Textile Mechanical Finishing',
    TYE_DYE: 'Tye Dye',
    WASHING: 'Washing',
    WET_PROCESSING: 'Wet Processing',
    WET_ROLLER_PRINTING: 'Wet roller printing',
    YARN_DYEING: 'Yarn Dyeing',
}

PRINTING_PROCESSING_TYPES_ALIAS = {
    'direct digital': DIRECT_DIGITAL_INK_PRINTING,
    'digital ink printing': DIRECT_DIGITAL_INK_PRINTING,
    'ink printing': DIRECT_DIGITAL_INK_PRINTING,
    'direct ink printing': DIRECT_DIGITAL_INK_PRINTING,
    'roller printing': WET_ROLLER_PRINTING,
    'wet printing': WET_ROLLER_PRINTING,
    'dyehouse': DYEING
}

BLENDING = 'blending'
BONDING = 'bonding'
BUFFING = 'buffing'
COMPONENTS = 'components'
DOUBLING = 'doubling'
EMBELLISHMENT = 'embellishment'
EMBOSSING = 'embossing'
EMBROIDERY = 'embroidery'
FABRIC_MILL = 'fabric mill'
FLAT_KNIT = 'flat knit'
FUSING = 'fusing'
GARMENT_ACCESSORIES_MANUFACTURING = 'garment accessories manufacturing'
KNITTING = 'knitting'
CIRCULAR_KNITTING = 'circular knitting'
LACE_KNITTING = 'lace knitting'
KNITTING_SEAMLEASS = 'knitting seamless'
KNITTING_V_BED = 'knitting v bed'
KNITTING_WARP = 'knitting warp'
LAMINATING = 'laminating'
MATERIAL_CREATION = 'material creation'
MATERIAL_PRODUCTION = 'material production'
MILL = 'mill'
NON_WOVEN_MANUFACTURING = 'non woven manufacturing'
NON_WOVEN_PROCESSING = 'non woven processing'
PAINTING = 'painting'
PELLETIZING = 'pelletizing'
PRESSING = 'pressing'
SPRAYING = 'spraying'
STRAIGHT_BAR_KNITTING = 'straight bar knitting'
TEXTILE_OR_MATERIAL_PRODUCTION = 'textile or material production'
TEXTILE_MILL = 'textile mill'
WEAVING = 'weaving'
WELDING = 'welding'

TEXTILE_PROCESSING_TYPES = {
    BLENDING: 'Blending',
    BONDING: 'Bonding',
    BUFFING: 'Buffing',
    COMPONENTS: 'Components',
    DOUBLING: 'Doubling',
    EMBELLISHMENT: 'Embellishment',
    EMBOSSING: 'Embossing',
    EMBROIDERY: 'Embroidery',
    FABRIC_MILL: 'Fabric mill',
    FLAT_KNIT: 'Flat Knit',
    FUSING: 'Fusing',
    GARMENT_ACCESSORIES_MANUFACTURING: 'Garment Accessories manufacturing',
    KNITTING: 'Knitting',
    CIRCULAR_KNITTING: 'Circular Knitting',
    LACE_KNITTING: 'Lace Knitting',
    KNITTING_SEAMLEASS: 'Knitting Seamless',
    KNITTING_V_BED: 'Knitting V Bed',
    KNITTING_WARP: 'Knitting Warp',
    LAMINATING: 'Laminating',
    MATERIAL_CREATION: 'Material Creation',
    MATERIAL_PRODUCTION: 'Material Production',
    MILL: 'Mill',
    NON_WOVEN_MANUFACTURING: 'Nonwoven manufacturing',
    NON_WOVEN_PROCESSING: 'Nonwoven Processing',
    PAINTING: 'Painting',
    PELLETIZING: 'Pelletizing',
    PRESSING: 'Pressing',
    SPRAYING: 'Spraying',
    STRAIGHT_BAR_KNITTING: 'Straight Bar Knitting',
    TEXTILE_OR_MATERIAL_PRODUCTION: 'Textile or Material Production',
    TEXTILE_MILL: 'Textile Mill',
    WEAVING: 'Weaving',
    WELDING: 'Welding',
}

TEXTILE_PROCESSING_TYPES_ALIAS = {
    'accessories manufacturing': GARMENT_ACCESSORIES_MANUFACTURING,
    'chemical finishing': TEXTILE_CHEMICAL_FINISHING,
    'mechanical finishing': TEXTILE_MECHANICAL_FINISHING,
    'textile production': TEXTILE_OR_MATERIAL_PRODUCTION,
}

BIOLOGICAL_RECYCLING = 'biological recycling'
BOILING = 'boiling'
BREEDING = 'breeding'
CHEMICAL_RECYCLING = 'chemical recycling'
CHEMICAL_SYNTHESIS = 'chemical synthesis'
COLLECTING = 'collecting'
CONCENTRATING = 'concentrating'
DISASSEMBLY = 'disassembly'
DOWN_PROCESSING = 'down processing'
DRY_SPINNING = 'dry spinning'
EXTRUSION = 'extrusion'
GINNING = 'ginning'
HATCHERY = 'hatchery'
MECHANICAL_RECYCLING = 'mechanical recycling'
MELT_SPINNING = 'melt spinning'
PREPARATION = 'preparation'
PREPARATORY = 'preparatory'
PROCESSING_SITE = 'processing site'
PULP_MAKING = 'pulp making'
RAW_MATERIAL_PROCESSING_OR_PRODUCTION = 'raw material processing or production'
RETTING = 'retting'
SCOURING = 'scouring'
SHREDDING = 'shredding'
SLAUGHTERHOUSE = 'slaughterhouse'
SLAUGHTERING = 'slaughtering'
SORTING = 'sorting'
SPINNING = 'spinning'
STANDARDIZATION_CHEMICAL_FINISHING = 'standardization chemical finishing'
SYNTHETIC_LEATHER_PRODUCTION = 'synthetic leather production'
TANNERY = 'tannery'
TANNING = 'tanning'
TEXTILE_RECYCLING = 'textile recycling'
TOP_MAKING = 'top making'
TWISTING_TEXTURIZING_FACILITY = 'twisting texturizing facility'
WET_SPINNING = 'wet spinning'
YARN_SPINNING = 'yarn spinning'

RAW_MATERIAL_PROCESSING_TYPES = {
    BIOLOGICAL_RECYCLING: 'Biological Recycling',
    BOILING: 'Boiling',
    BREEDING: 'Breeding',
    CHEMICAL_RECYCLING: 'Chemical Recycling',
    CHEMICAL_SYNTHESIS: 'Chemical Synthesis',
    COLLECTING: 'Collecting',
    CONCENTRATING: 'Concentrating',
    DISASSEMBLY: 'Disassembly',
    DOWN_PROCESSING: 'Down Processing',
    DRY_SPINNING: 'Dry Spinning',
    EXTRUSION: 'Extrusion',
    GINNING: 'Ginning',
    HATCHERY: 'Hatchery',
    MECHANICAL_RECYCLING: 'Mechanical Recycling',
    MELT_SPINNING: 'Melt Spinning',
    PREPARATION: 'Preparation',
    PREPARATORY: 'Preparatory',
    PROCESSING_SITE: 'Processing Site',
    PULP_MAKING: 'Pulp making',
    RAW_MATERIAL_PROCESSING_OR_PRODUCTION: ('Raw Material Processing '
                                            'or Production'),
    RETTING: 'Retting',
    SCOURING: 'Scouring',
    SHREDDING: 'Shredding',
    SLAUGHTERHOUSE: 'Slaughterhouse',
    SLAUGHTERING: 'Slaughtering',
    SORTING: 'Sorting',
    SPINNING: 'Spinning',
    STANDARDIZATION_CHEMICAL_FINISHING: ('Standardization / '
                                         'Chemical finishing'),
    SYNTHETIC_LEATHER_PRODUCTION: 'Synthetic Leather Production',
    TANNERY: 'Tannery',
    TANNING: 'Tanning',
    TEXTILE_RECYCLING: 'Textile Recycling',
    TOP_MAKING: 'Top making',
    TWISTING_TEXTURIZING_FACILITY: 'Twisting/Texturizing Facility',
    WET_SPINNING: 'Wet Spinning',
    YARN_SPINNING: 'Yarn spinning',
}

RAW_MATERIAL_PROCESSING_TYPES_ALIAS = {
    'raw material processing': RAW_MATERIAL_PROCESSING_OR_PRODUCTION,
    'raw material production': RAW_MATERIAL_PROCESSING_OR_PRODUCTION,
    'standardization': STANDARDIZATION_CHEMICAL_FINISHING,
    'chemical finishing': STANDARDIZATION_CHEMICAL_FINISHING,
    'twisting facility': TWISTING_TEXTURIZING_FACILITY,
    'texturizing facility': TWISTING_TEXTURIZING_FACILITY,
}

RAW_MATERIAL_PROCESSING = 'raw material processing or production'
TEXTILE_PROCESSING = 'textile or material production'
PRINTING_PROCESSING = 'printing product dyeing and laundering'
ASSEMBLY_PROCESSING = 'final product assembly'
WAREHOUSING_PROCESSING = 'warehousing distribution'
OFFICE_PROCESSING = 'office hq'

ALL_FACILITY_TYPES = {
    RAW_MATERIAL_PROCESSING: 'Raw Material Processing or Production',
    TEXTILE_PROCESSING: 'Textile or Material Production',
    PRINTING_PROCESSING: 'Printing, Product Dyeing and Laundering',
    ASSEMBLY_PROCESSING: 'Final Product Assembly',
    WAREHOUSING_PROCESSING: 'Warehousing / Distribution',
    OFFICE_PROCESSING: 'Office / HQ'
}

ALL_FACILITY_TYPE_CHOICES = [(k, v) for k, v in
                             sorted(ALL_FACILITY_TYPES.items())]

FACILITY_PROCESSING_TYPES = {
    RAW_MATERIAL_PROCESSING: RAW_MATERIAL_PROCESSING_TYPES,
    TEXTILE_PROCESSING: TEXTILE_PROCESSING_TYPES,
    PRINTING_PROCESSING: PRINTING_PROCESSING_TYPES,
    ASSEMBLY_PROCESSING: ASSEMBLY_PROCESSING_TYPES,
    WAREHOUSING_PROCESSING: WAREHOUSING_PROCESSING_TYPES,
    OFFICE_PROCESSING: OFFICE_PROCESSING_TYPES,
}

# Create a look-up of processing type -> facility type for
# every processing type
PROCESSING_TYPES_TO_FACILITY_TYPES = {}
for facility_type, processing_types in FACILITY_PROCESSING_TYPES.items():
    for processing_type_key, processing_type_value in processing_types.items():
        PROCESSING_TYPES_TO_FACILITY_TYPES.setdefault(processing_type_value,
                                                      ALL_FACILITY_TYPES[
                                                          facility_type
                                                      ])
# Field types
FACILITY_TYPE = 'FACILITY_TYPE'
PROCESSING_TYPE = 'PROCESSING_TYPE'

# Match types
EXACT_MATCH = 'EXACT'
ALIAS_MATCH = 'ALIAS'
FUZZY_MATCH = 'FUZZY'

ALL_PROCESSING_TYPES = {
    **OFFICE_PROCESSING_TYPES,
    **WAREHOUSING_PROCESSING_TYPES,
    **ASSEMBLY_PROCESSING_TYPES,
    **PRINTING_PROCESSING_TYPES,
    **TEXTILE_PROCESSING_TYPES,
    **RAW_MATERIAL_PROCESSING_TYPES,
}

ALL_PROCESSING_TYPE_CHOICES = [(k, v) for k, v in
                               sorted(ALL_PROCESSING_TYPES.items())]

ALL_PROCESSING_TYPES_ALIAS = {
    **OFFICE_PROCESSING_TYPES_ALIAS,
    **WAREHOUSING_PROCESSING_TYPES_ALIAS,
    **ASSEMBLY_PROCESSING_TYPES_ALIAS,
    **PRINTING_PROCESSING_TYPES_ALIAS,
    **TEXTILE_PROCESSING_TYPES_ALIAS,
    **RAW_MATERIAL_PROCESSING_TYPES_ALIAS,
}


FACILITY_PROCESSING_TYPES_VALUES = [{
    'facilityType': v,
    'processingTypes': sorted(FACILITY_PROCESSING_TYPES[k].values())
} for k, v in sorted(ALL_FACILITY_TYPES.items())]


def get_facility_and_processing_type(facility_or_processing_type):
    """Attempts to match the input value to a facility or processing
    type via various methods.
    """
    # Clean up input value
    cleaned_input = clean(facility_or_processing_type)
    # Assign a default value to field_type
    field_type = PROCESSING_TYPE

    # Try for exact match
    processing_type = ALL_PROCESSING_TYPES.get(cleaned_input)
    facility_type = ALL_FACILITY_TYPES.get(cleaned_input)
    match_type = EXACT_MATCH

    # Try for alias match
    if not processing_type:
        matched_value = ALL_PROCESSING_TYPES_ALIAS.get(cleaned_input)
        match_type = ALIAS_MATCH

        # Try for fuzzy match
        if not matched_value or matched_value is None:
            matched_value = process.extractOne(
                cleaned_input,
                ALL_PROCESSING_TYPES.keys()
            )
            match_type = FUZZY_MATCH

            # Match must score 85 or higher to be considered usable.
            if not matched_value or matched_value[1] < 85:
                return (None, None, None, None)

            matched_value = matched_value[0]

        # Using the alias or fuzzy matched value, find a
        # processing and facility type
        processing_type = ALL_PROCESSING_TYPES.get(matched_value)
        facility_type = ALL_FACILITY_TYPES.get(matched_value)

    if facility_type:
        field_type = FACILITY_TYPE
    elif processing_type:
        # Find which facility type the processing type is
        # categorized under
        facility_type = PROCESSING_TYPES_TO_FACILITY_TYPES.get(
            processing_type
        )

    return (field_type, match_type, facility_type, processing_type)
