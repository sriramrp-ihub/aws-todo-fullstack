# ECS CLUSTER 

resource "aws_ecs_cluster" "main" {
  name = "todoapp-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "todoapp-cluster"
  }
}

#  BACKEND TASK DEFINITION

resource "aws_ecs_task_definition" "backend" {
  family                   = "todoapp-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024" #  256 backend + 512 grafana + 256 prometheus 
  memory                   = "2048" # 512 backend + 512 prometheus + 1024 grafana
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      essential = true
      cpu       = 256 # 0.25 vCPU for backend
      memory    = 512

      portMappings = [
        {
          containerPort = 8008
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DB_HOST"
          value = split(":", aws_db_instance.main.endpoint)[0]
        },
        {
          name  = "DB_PORT"
          value = "3306"
        },
        {
          name  = "DB_USERNAME"
          value = "todouser"
        },
        {
          name  = "DB_PASSWORD"
          value = var.db_password
        },
        {
          name  = "DB_DATABASE"
          value = "todoapp"
        },
        {
          name  = "JWT_SECRET"
          value = var.jwt_secret
        },
        {
          name  = "JWT_EXPIRES_IN"
          value = "7d"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/todoapp-backend"
          "awslogs-region"        = "ca-west-1"
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
    },
    {
      name      = "prometheus"
      image     = "${aws_ecr_repository.prometheus.repository_url}:latest"
      essential = false
      cpu       = 256
      memory    = 512

      portMappings = [
        {
          containerPort = 9090
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/todoapp-prometheus"
          "awslogs-region"        = "ca-west-1"
          "awslogs-stream-prefix" = "prometheus"
          "awslogs-create-group"  = "true"
        }
      }


      dependsOn = [
        {
          containerName = "backend"
          condition     = "START"
        }
      ]
    },

    {
      name      = "grafana"
      image     = "${aws_ecr_repository.grafana.repository_url}:latest"
      essential = false
      cpu       = 512
      memory    = 1024

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "GF_SERVER_ROOT_URL"
          value = "http://${aws_lb.main.dns_name}/grafana/"
        },
        {
          name  = "GF_SERVER_SERVE_FROM_SUB_PATH"
          value = "true"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/todoapp-grafana"
          "awslogs-region"        = "ca-west-1"
          "awslogs-stream-prefix" = "grafana"
          "awslogs-create-group"  = "true"
        }
      }

      dependsOn = [
        {
          containerName = "prometheus"
          condition     = "START"
        }
      ]
    }
  ])

  tags = {
    Name        = "todoapp-backend-with-prometheus"
    Environment = "production"
  }

}

# FRONTEND TASK DEFINITION 

resource "aws_ecs_task_definition" "frontend" {
  family                   = "todoapp-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = "${aws_ecr_repository.frontend.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/todoapp-frontend"
          "awslogs-region"        = "ca-west-1"
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
    }
  ])
}
resource "aws_ecs_service" "backend" {
  name            = "todoapp-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8008
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.grafana.arn
    container_name   = "grafana"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "frontend" {
  name            = "todoapp-frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.http]
}
resource "aws_iam_role_policy" "ecs_task_execution_cloudwatch" {
  name = "todoapp-ecs-task-execution-cloudwatch-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}
