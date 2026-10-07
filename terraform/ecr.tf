# Backend ECR Repository
resource "aws_ecr_repository" "backend" {
  name                 = "todoapp-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true # Scan for vulnerabilities
  }

  tags = {
    Name = "todoapp-backend"
  }
}

# prometheus
resource "aws_ecr_repository" "prometheus" {
  name                 = "todoapp-prometheus"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "todoapp-prometheus"
    Environment = "production"
  }
}

# grafana
resource "aws_ecr_repository" "grafana" {
  name                 = "todoapp-grafana"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "todoapp-grafana"
    Environment = "production"
  }
}

# Frontend ECR Repository
resource "aws_ecr_repository" "frontend" {
  name                 = "todoapp-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "todoapp-frontend"
  }
}


