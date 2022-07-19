---
title: 'Attended temperature scaling: a practical approach for calibrating deep neural networks'

# Authors
# If you created a profile for a user (e.g. the default `admin` user), write the username (folder name) here
# and it will be replaced with their full name and linked to their profile.
authors:
  - Azadeh Sadat Mozafari
  - Hugo Siqueira Gomes
  - Wilson Leao
  - admin
  - Christian Gagné

date: '2018-10-27T00:00:00Z'
doi: ''

# Schedule page publish date (NOT publication's date).
publishDate: '2018-10-27T00:00:00Z'

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ['3']

# Publication name and optional abbreviated publication name.
publication: ArXiv pre-print
publication_short: ArXiv

# Summary. An optional shortened abstract.
summary: ArXiv Preprint

tags: []

# Display this page in the Featured widget?
featured: true

url_pdf: 'https://arxiv.org/abs/1810.11586'
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
Recently, Deep Neural Networks (DNNs) have been achieving impressive results on wide range of tasks. However, they suffer from being well-calibrated. In decision-making applications, such as autonomous driving or medical diagnosing, the confidence of deep networks plays an important role to bring the trust and reliability to the system. To calibrate the deep networks' confidence, many probabilistic and measure-based approaches are proposed. Temperature Scaling (TS) is a state-of-the-art among measure-based calibration methods which has low time and memory complexity as well as effectiveness. In this paper, we study TS and show it does not work properly when the validation set that TS uses for calibration has small size or contains noisy-labeled samples. TS also cannot calibrate highly accurate networks as well as non-highly accurate ones. Accordingly, we propose Attended Temperature Scaling (ATS) which preserves the advantages of TS while improves calibration in aforementioned challenging situations. We provide theoretical justifications for ATS and assess its effectiveness on wide range of deep models and datasets. We also compare the calibration results of TS and ATS on skin lesion detection application as a practical problem where well-calibrated system can play important role in making a decision.