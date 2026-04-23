import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const stats = [
    { value: '800M+', label: 'Children at Risk Globally' },
    { value: '95%', label: 'Detection Accuracy' },
    { value: '< 2s', label: 'Search Time' },
    { value: '24/7', label: 'System Availability' },
]

const features = [
    {
        icon: '🔬',
        title: 'AI Face Detection',
        description: 'YOLOv11-powered face detection identifies faces instantly from any angle with high precision.',
    },
    {
        icon: '🧬',
        title: 'FaceNet Recognition',
        description: 'Generates 512-dimensional face embeddings using DeepFace FaceNet for accurate identity matching.',
    },
    {
        icon: '⚡',
        title: 'Vector Similarity Search',
        description: 'pgvector cosine similarity search across thousands of records in milliseconds.',
    },
    {
        icon: '📊',
        title: 'Analytics Dashboard',
        description: 'Track missing children, search history, and match statistics in real-time.',
    },
    {
        icon: '🔒',
        title: 'Secure & Private',
        description: 'JWT authentication, encrypted data, and rate limiting protect sensitive information.',
    },
    {
        icon: '🌐',
        title: 'Mobile Friendly',
        description: 'Fully responsive design works on any device — phones, tablets, and desktops.',
    },
]

export default function Home() {
    return (
        <div className="home-page">
            {/* ── Hero ── */}
            <section className="hero">
                <div className="hero-bg" />
                <div className="container">
                    <div className="hero-content animate-fade-up">
                        <div className="hero-badge">
                            <span className="badge badge-info">AI-Powered System</span>
                        </div>
                        <h1 className="hero-title">
                            Find Missing Children
                            <br />
                            <span className="gradient-text">with Facial Recognition</span>
                        </h1>
                        <p className="hero-subtitle">
                            An AI-powered identification system that uses advanced facial recognition to help
                            reunite missing children with their families. Upload a photo, get results in seconds.
                        </p>
                        <div className="hero-actions">
                            <Link to="/search" className="btn btn-primary btn-lg">
                                🔎 Search For A Child
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                Admin Portal →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="stats-section container">
                <div className="stats-grid">
                    {stats.map((s, i) => (
                        <div key={i} className="stat-card card-glass" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="how-section container">
                <div className="section-header text-center">
                    <h2>How It Works</h2>
                    <p className="text-muted">Three simple steps to identify a missing child</p>
                </div>
                <div className="steps-grid">
                    <div className="step-card card">
                        <div className="step-number">01</div>
                        <div className="step-icon">📸</div>
                        <h3>Upload Photo</h3>
                        <p className="text-muted text-sm">Upload a clear photo of the found child through our secure portal.</p>
                    </div>
                    <div className="step-connector" />
                    <div className="step-card card">
                        <div className="step-number">02</div>
                        <div className="step-icon">🤖</div>
                        <h3>AI Analysis</h3>
                        <p className="text-muted text-sm">YOLOv11 detects the face, DeepFace generates a 512-dim embedding.</p>
                    </div>
                    <div className="step-connector" />
                    <div className="step-card card">
                        <div className="step-number">03</div>
                        <div className="step-icon">✅</div>
                        <h3>Get Results</h3>
                        <p className="text-muted text-sm">Cosine similarity search returns matches with confidence percentage.</p>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="features-section container">
                <div className="section-header text-center">
                    <h2>System Features</h2>
                    <p className="text-muted">Built for reliability, accuracy, and scale</p>
                </div>
                <div className="grid-3">
                    {features.map((f, i) => (
                        <div key={i} className="feature-card card" style={{ animationDelay: `${i * 0.1}s` }}>
                            <span className="feature-icon">{f.icon}</span>
                            <h3 className="feature-title">{f.title}</h3>
                            <p className="text-muted text-sm">{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section container">
                <div className="cta-card card-glass text-center">
                    <h2>Ready to Help?</h2>
                    <p className="text-muted mt-4">
                        Found a child and want to search our database? Use our free search tool — no login required.
                    </p>
                    <div className="flex items-center gap-4 mt-8" style={{ justifyContent: 'center' }}>
                        <Link to="/search" className="btn btn-primary btn-lg">Start Searching</Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="home-footer">
                <div className="container text-center">
                    <p className="text-sm text-muted">
                        MCIS — Missing Child Identification System &nbsp;|&nbsp;
                        Built with FastAPI, React, DeepFace & pgvector
                    </p>
                </div>
            </footer>
        </div>
    )
}
