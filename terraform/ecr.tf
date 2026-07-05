resource "aws_ecr_repository" "backend" {
  name = "giants-ecr-backend"

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "frontend" {
  name = "giants-ecr-frontend"

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "MUTABLE"
}