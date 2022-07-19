---
title: 'Learning to estimate UAV created turbulence from scene structure observed by onboard cameras'

# Authors
# If you created a profile for a user (e.g. the default `admin` user), write the username (folder name) here
# and it will be replaced with their full name and linked to their profile.
authors:
  - Quentin Possamaï
  - admin
  - Madiha Nadri
  - Laurent Bako
  - Christian Wolf

date: '2022-03-28T00:00:00Z'
doi: ''

# Schedule page publish date (NOT publication's date).
publishDate: '2022-03-28T00:00:00Z'

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ['3']

# Publication name and optional abbreviated publication name.
publication: ArXiv Preprint
publication_short: ArXiv

# Summary. An optional shortened abstract.
summary: ArXiv Preprint

tags: []

# Display this page in the Featured widget?
featured: true

url_pdf: 'https://arxiv.org/abs/2203.14726'
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  focal_point: ''
  preview_only: false


---
Controlling UAV flights precisely requires a realistic dynamic model and accurate state estimates from onboard sensors like UAV, GPS and visual observations. Obtaining a precise dynamic model is extremely difficult, as important aerodynamic effects are hard to model, in particular ground effect and other turbulences. While machine learning has been used in the past to estimate UAV created turbulence, this was restricted to flat grounds or diffuse in-flight air turbulences, both without taking into account obstacles. In this work we address the complex problem of estimating in-flight turbulences caused by obstacles, in particular the complex structures in cluttered environments. We learn a mapping from control input and images captured by onboard cameras to turbulence. In a large-scale setting, we train a model over a large number of different simulated photo-realistic environments loaded into the Habitat simulator augmented with a dynamic UAV model and an analytic ground effect model. We transfer the model from simulation to a real environment and evaluate on real UAV flights from the EuRoC-MAV dataset, showing that the model is capable of good sim2real generalization performance. The dataset will be made publicly available upon acceptance.