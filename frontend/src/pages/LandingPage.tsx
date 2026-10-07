import { Link } from "react-router-dom";
import { CheckSquare, Zap, Shield, Cloud } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <CheckSquare className="text-primary-600" size={64} />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">TodoApp</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A production-grade todo application built with React, TypeScript,
            Redux, and AWS infrastructure
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="btn btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link
              to="/register"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Zap className="text-primary-600" size={32} />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Built with modern tech stack for optimal performance
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Shield className="text-primary-600" size={32} />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Secure</h3>
            <p className="text-gray-600">
              JWT authentication with bcrypt password hashing
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Cloud className="text-primary-600" size={32} />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Cloud-Native</h3>
            <p className="text-gray-600">
              Deployed on AWS ECS Fargate with Terraform Infrastructure as Code
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Built With</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "React",
              "TypeScript",
              "Redux Toolkit",
              "Tailwind CSS",
              "Node.js",
              "AWS ECS",
              "RDS",
              "Terraform",
              "Docker",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-white rounded-lg shadow-sm text-gray-700 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
