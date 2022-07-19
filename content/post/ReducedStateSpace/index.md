---
title: 'Learning Reduced Nonlinear State-Space Models: an Output-Error Based Canonical Approach'

# Authors
# If you created a profile for a user (e.g. the default `admin` user), write the username (folder name) here
# and it will be replaced with their full name and linked to their profile.
authors:
  - admin
  - Quentin Possamaï
  - Laurent Bako
  - Madiha Nadri
  - Christian Wolf

date: '2022-04-19T00:00:00Z'
doi: ''

# Schedule page publish date (NOT publication's date).
publishDate: '2021-03-23T00:00:00Z'

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ['1']

# Publication name and optional abbreviated publication name.
publication: Conference on Decision and Control
publication_short: CDC

# Summary. An optional shortened abstract.
summary: To appear in Conference on Decision and Control (CDC 2022)

tags: []

# Display this page in the Featured widget?
featured: true

url_pdf: 'https://arxiv.org/abs/2206.04791'
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
The identification of a nonlinear dynamic model is an open topic in control theory, especially from sparse input-output measurements. A fundamental challenge of this problem is that very few to zero prior knowledge is available on both the state and the nonlinear system model. To cope with this challenge, we investigate the effectiveness of deep learning in the modeling of dynamic systems with nonlinear behavior by advocating an approach which relies on three main ingredients: (i) we show that under some structural conditions on the to-be-identified model, the state can be expressed in function of a sequence of the past inputs and outputs; (ii) this relation which we call the state map can be modelled by resorting to the well-documented approximation power of deep neural networks; (iii) taking then advantage of existing learning schemes, a state-space model can be finally identified. After the formulation and analysis of the approach, we show its ability to identify three different nonlinear systems. The performances are evaluated in terms of open-loop prediction on test data generated in simulation as well as a real world data-set of unmanned aerial vehicle flight measurements.