resource "aws_ecr_repository" "app" {
  name = "giants-sre-dashboard"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "giants-sre-dashboard"
  }
}

resource "aws_ecr_repository" "frontend" {
  name = "giants-sre-frontend"

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "MUTABLE"
}