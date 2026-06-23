resource "aws_ecr_repository" "app" {
  name = "giants-sre-dashboard"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "giants-sre-dashboard"
  }
}