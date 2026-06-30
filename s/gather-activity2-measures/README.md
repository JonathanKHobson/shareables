# GATHER Activity 2 Measure Questions Shareable

Lightweight static artifact for publishing the five Activity 2 measure-centered recommendations with progressive disclosure and source-linked citation cards.

## Entry Point

- `index.html`
- Data source: `data/recommendations.json`
- North-star reference image: `assets/images/north-star-website.png`

## Source of Truth

The page is generated from:

- `activity1_literature_review_ai/outputs/GATHER_Activity1_Augmented_Evidence_Matrix.xlsx`
- `Top_Recommendations`
- `Recommendation_Source_Key`

Rebuild command from the project root:

```bash
python3 activity1_literature_review_ai/scripts/build_activity2_shareable.py
```

## Source Links

Citation chips link to source cards inside the page. DOI or public web links are included when available. Local source-file lookup text is preserved so Google Drive links can be added later after source files are uploaded and permissions are set.

This folder is structured for the public Shareables GitHub Pages lane.
