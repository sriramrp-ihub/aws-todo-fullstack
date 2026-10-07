#Security Groups

resource "aws_security_group" "alb" {

  name        = "todoapp-alb-sg"
  description = "Security group for alb"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80 #http
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Http is allowed from internet"
  }

  ingress {
    from_port   = 443 #https
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Https is allowed from internet"
  }

  egress {
    description = "Allow traffic to targets"
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # Alb can talk to EC2,ECS, k8s etc
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "todoapp-alb-sg"
  }

}

#ECS security Group => only from ALB

resource "aws_security_group" "ecs" {
  name        = "todoapp-ecs-sg"
  description = "Sg for ECS containers"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 8008
    to_port         = 8008
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Traffic from ALB on port 8008 allowed"
  }

  # frontend (port 80) and backend (port 8008) traffic from ALB
  ingress {
    description     = "Traffic from ALB on port 80 for frontend"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Grafana traffic from ALB
  ingress {
    description     = "Traffic from ALB on port 3000 for Grafana"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound allowed"
  }

  tags = {
    Name = "todoapp-ecs-sg"
  }


}

# RDS Security group allow traffic from ECS only
resource "aws_security_group" "rds" {
  name        = "todoapp-rds-sg"
  description = "Security group for RDS MySQL database"
  vpc_id      = aws_vpc.main.id

  # Allow MySQL from ecs 
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
    description     = "Allow MySQL from ECS containers"
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
  tags = {
    Name = "todoapp-rds-sg"
  }
}

