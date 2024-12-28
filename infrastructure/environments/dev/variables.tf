variable "project_id" {
    description = "Google Cloud project ID"
    type = string    
}

variable "region" {
    description = "Region to deploy Google Cloud resources"
    type = string
}

variable "env" {
    description = "Environment to deploy Google Cloud resources"
    type = string
}

variable "backend_cpu_limit" {
    description = "CPU limit for cloud run serverless infra. E.g. 2"
    type = string     
}

variable "backend_memory_limit" {
  description = "Memory limit for cloud run serverless infra in Gi. E.g. 4Gi"
  type        = string
}

variable "backend_registry_name" {
    description = "Name of the backend docker artifact registry"
    type = string 
}

variable "backend_app_name" {
    description = "Name of the backend app."
    type = string 
}