# Research Component Index
*Last Updated: [Timestamp]*

This file maps conceptual research components to their primary file locations and relationships.

## Paper Sections
| Section Name          | Primary File Path                     | Type/Description           | Related Files (Optional)     |
|-----------------------|---------------------------------------|----------------------------|-------------------------------|
| Abstract              | `sections/abstract.tex`               | Paper Section              | `main.tex`                    |
| Introduction          | `sections/introduction.tex`           | Paper Section              | `figures/intro_diagram.pdf`  |
| Literature Review     | `sections/literature.tex`            | Paper Section              | `bibliography.bib`           |
| Methodology           | `sections/methods.tex`                | Paper Section              | `figures/method_flow.pdf`    |
| Results               | `sections/results.tex`                | Paper Section              | `data/`, `figures/results/`  |
| Discussion            | `sections/discussion.tex`             | Paper Section              | `figures/discussion/`        |
| Conclusion            | `sections/conclusion.tex`             | Paper Section              | -                             |

## Research Components
| Component Name        | Primary File Path                     | Type/Description           | Related Files (Optional)     |
|-----------------------|---------------------------------------|----------------------------|-------------------------------|
| Main Analysis         | `analysis/main_analysis.py`          | Analysis Script            | `data/processed/`, `config/`  |
| Data Processing       | `scripts/data_processing.py`         | Data Pipeline              | `data/raw/`, `data/clean/`    |
| Statistical Tests     | `analysis/statistics.R`              | Statistical Analysis       | `results/stats/`              |
| Visualization         | `scripts/plotting.py`                | Figure Generation          | `figures/`, `plots/`          |
| Model Implementation  | `models/primary_model.py`            | Mathematical Model         | `equations/`, `validation/`   |

## Data Components
| Data Type             | Primary Location                      | Description                | Processing Scripts            |
|-----------------------|---------------------------------------|----------------------------|-------------------------------|
| Raw Data              | `data/raw/experiment_data.csv`       | Original Measurements      | `scripts/clean_data.py`       |
| Processed Data        | `data/processed/clean_data.csv`      | Cleaned Dataset            | `analysis/main_analysis.py`   |
| Derived Results       | `results/calculations/`              | Computed Values            | `analysis/derive_results.py`  |
| Figure Data           | `data/figures/`                      | Plot-ready Data            | `scripts/plotting.py`         |

## Supporting Materials
| Material Type         | Primary Location                      | Description                | Dependencies                  |
|-----------------------|---------------------------------------|----------------------------|-------------------------------|
| Bibliography          | `bibliography.bib`                   | Reference Database         | `sections/*.tex`              |
| Supplementary Info    | `supplementary/`                     | Additional Materials       | `main.tex`                    |
| Appendices            | `appendices/`                        | Extended Content           | `main.tex`                    |
| Code Documentation    | `docs/code_documentation.md`        | Technical Documentation    | `analysis/`, `scripts/`       |

## External Dependencies
| Dependency Type       | Location/Reference                    | Purpose                    | Version/Details               |
|-----------------------|---------------------------------------|----------------------------|-------------------------------|
| Software Packages     | `requirements.txt` or `environment.yml` | Analysis Dependencies    | Python/R package versions     |
| External Data         | `data/external/`                     | Third-party Datasets       | Source attribution            |
| Collaboration Files   | `shared/`                            | Shared Resources           | Access permissions            |

## Notes
- This index focuses on primary entry points and key relationships between research components
- Keep this updated when files are added, moved, or renamed
- For LaTeX projects, main.tex typically includes all section files
- Data processing pipelines should be clearly documented with input/output relationships
- Analysis scripts should reference specific data files and output locations

## File Naming Conventions
- **Sections**: Use descriptive names matching paper structure
- **Data**: Include date stamps for versioning (e.g., `data_2025-05-23.csv`)
- **Figures**: Use section prefixes (e.g., `results_figure1.pdf`)
- **Scripts**: Use verb_noun format (e.g., `process_data.py`, `generate_plots.R`)
