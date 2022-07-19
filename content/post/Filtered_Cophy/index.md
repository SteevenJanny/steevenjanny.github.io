---
title: 'Filtered-CoPhy: Unsupervised Learning of Counterfactual Physics in Pixel Space'

# Authors
# If you created a profile for a user (e.g. the default `admin` user), write the username (folder name) here
# and it will be replaced with their full name and linked to their profile.
authors:
  - admin
  - Fabien Baradel
  - Natalia Neverova
  - Madiha Nadri
  - Christian Wolf

date: '2022-02-01T00:00:00Z'
doi: ''

# Schedule page publish date (NOT publication's date).
publishDate: '2022-02-01T00:00:00Z'

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ['1']

# Publication name and optional abbreviated publication name.
publication: International Conference on Learning Representation
publication_short: ICLR

# Summary. An optional shortened abstract.
summary: ICLR 2022 (Oral)
tags: []

# Display this page in the Featured widget?
featured: true

url_pdf: 'https://openreview.net/forum?id=1L0C5ROtFp'
url_code: 'https://github.com/filteredcophy/FilteredCoPhy'
url_dataset: 'https://zenodo.org/record/5906002#.YtaA1uxBxmr'
url_poster: ''
url_project: 'https://filteredcophy.github.io/'
url_source: ''
url_video: 'https://www.youtube.com/watch?v=y40wzlfIr8g&t=7s&ab_channel=SteevenJanny'

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  focal_point: ''
  preview_only: false


---
Learning causal relationships in high-dimensional data (images, videos) is a hard task, as they are often defined on low dimensional manifolds and must be extracted from complex signals dominated by appearance, lighting, textures and also spurious correlations in the data. We present a method for learning counterfactual reasoning of physical processes in pixel space, which requires the prediction of the impact of interventions on initial conditions. Going beyond the identification of structural relationships, we deal with the challenging problem of forecasting raw video over long horizons. Our method does not require the knowledge or supervision of any ground truth positions or other object or scene properties. Our model learns and acts on a suitable hybrid latent representation based on a combination of dense features, sets of 2D keypoints and an additional latent vector per keypoint. We show that this better captures the dynamics of physical processes than purely dense or sparse representations. We introduce a new challenging and carefully designed counterfactual benchmark for predictions in pixel space and outperform strong baselines in physics-inspired ML and video prediction.