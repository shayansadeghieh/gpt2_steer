terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  backend "gcs" {
    bucket = "b0d2f4099eb2a2da-terraform-remote-backend"
  }
}
