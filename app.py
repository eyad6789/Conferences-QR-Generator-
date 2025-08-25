#!/usr/bin/env python3
"""
Conference Ticket Generator - Complete Flask Backend
A single-file Flask application with QR code generation and bilingual support
"""

from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime, date
import base64
from io import BytesIO
from PIL import Image
import qrcode
import json
import sqlite3

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///conference.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['QR_FOLDER'] = 'qr_codes'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024  # 500KB max file size
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'

# Enable CORS for all routes
CORS(app, origins=['http://localhost:5173'])  # Vite default port

# Initialize database
db = SQLAlchemy(app)

# Create directories if they don't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['QR_FOLDER'], exist_ok=True)

# Database Model
class Participant(db.Model):
    """Participant model for storing conference registrations"""
    __tablename__ = 'participant'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.String(20), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    github_username = db.Column(db.String(50), nullable=False)
    avatar_filename = db.Column(db.String(100), nullable=True)
    qr_code_filename = db.Column(db.String(100), nullable=True)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert participant to dictionary"""
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'full_name': self.full_name,
            'email': self.email,
            'github_username': self.github_username,
            'avatar_filename': self.avatar_filename,
            'qr_code_filename': self.qr_code_filename,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None
        }

# Utility Functions
def allowed_file(filename):
    """Check if uploaded file has allowed extension"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_image(file_data):
    """Process and resize uploaded image"""
    try:
        # Decode base64 image
        if ',' in file_data:
            image_data = base64.b64decode(file_data.split(',')[1])
        else:
            image_data = base64.b64decode(file_data)
            
        image = Image.open(BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')
        
        # Resize image while maintaining aspect ratio
        max_size = (200, 200)
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save processed image
        filename = f"avatar_{uuid.uuid4().hex[:8]}.jpg"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image.save(filepath, 'JPEG', quality=85, optimize=True)
        
        return filename
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

def generate_qr_code(participant_data):
    """Generate QR code for participant ticket"""
    try:
        # Create QR code data
        qr_data = {
            'ticket_id': participant_data['ticket_id'],
            'name': participant_data['full_name'],
            'email': participant_data['email'],
            'github': participant_data['github_username'],
            'event': 'Coding Conf 2025',
            'location': 'Austin, TX',
            'date': '2025-08-23',
            'verified': True,
            'generated_at': datetime.utcnow().isoformat()
        }
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(json.dumps(qr_data, ensure_ascii=False))
        qr.make(fit=True)
        
        # Create QR code image with custom colors
        qr_img = qr.make_image(
            fill_color="#1a1a2e",  # Dark color
            back_color="white"
        )
        
        # Save QR code
        filename = f"qr_{participant_data['ticket_id']}.png"
        filepath = os.path.join(app.config['QR_FOLDER'], filename)
        qr_img.save(filepath, optimize=True)
        
        return filename
    except Exception as e:
        print(f"Error generating QR code: {e}")
        return None

def generate_ticket_id():
    """Generate unique ticket ID"""
    while True:
        ticket_id = f"TC{uuid.uuid4().hex[:6].upper()}"
        # Check if ticket ID already exists
        existing = Participant.query.filter_by(ticket_id=ticket_id).first()
        if not existing:
            return ticket_id

# API Routes
@app.route('/api/register', methods=['POST'])
def register_participant():
    """Register a new participant and generate ticket"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'github_username']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        email = data['email'].strip().lower()
        if '@' not in email or '.' not in email.split('@')[1]:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if email already exists
        existing = Participant.query.filter_by(email=email).first()
        if existing:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Process avatar if provided
        avatar_filename = None
        if data.get('avatar'):
            avatar_filename = process_image(data['avatar'])
            if not avatar_filename:
                return jsonify({'error': 'Failed to process avatar image'}), 400
        
        # Generate unique ticket ID
        ticket_id = generate_ticket_id()
        
        # Clean GitHub username
        github_username = data['github_username'].strip().replace('@', '')
        
        # Generate QR code
        qr_filename = generate_qr_code({
            'ticket_id': ticket_id,
            'full_name': data['full_name'].strip(),
            'email': email,
            'github_username': github_username
        })
        
        # Create participant
        participant = Participant(
            ticket_id=ticket_id,
            full_name=data['full_name'].strip(),
            email=email,
            github_username=github_username,
            avatar_filename=avatar_filename,
            qr_code_filename=qr_filename
        )
        
        db.session.add(participant)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'ticket_id': ticket_id,
            'participant': participant.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed. Please try again.'}), 500

@app.route('/api/participants', methods=['GET'])
def get_participants():
    """Get list of participants with pagination and search"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '').strip()
        
        # Build query
        query = Participant.query
        
        # Apply search filter
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                (Participant.full_name.ilike(search_term)) |
                (Participant.email.ilike(search_term)) |
                (Participant.github_username.ilike(search_term)) |
                (Participant.ticket_id.ilike(search_term))
            )
        
        # Apply pagination
        participants = query.order_by(Participant.registration_date.desc()).paginate(
            page=page, 
            per_page=min(per_page, 100),  # Limit max per page
            error_out=False
        )
        
        return jsonify({
            'participants': [p.to_dict() for p in participants.items],
            'total': participants.total,
            'pages': participants.pages,
            'current_page': page,
            'per_page': per_page
        })
        
    except Exception as e:
        print(f"Error fetching participants: {e}")
        return jsonify({'error': 'Failed to fetch participants'}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get registration statistics"""
    try:
        total_participants = Participant.query.count()
        
        # Count today's registrations
        today = date.today()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        today_registrations = Participant.query.filter(
            Participant.registration_date >= today_start,
            Participant.registration_date <= today_end
        ).count()
        
        # Count this week's registrations
        from datetime import timedelta
        week_start = today - timedelta(days=today.weekday())
        week_start = datetime.combine(week_start, datetime.min.time())
        
        week_registrations = Participant.query.filter(
            Participant.registration_date >= week_start
        ).count()
        
        return jsonify({
            'total_participants': total_participants,
            'today_registrations': today_registrations,
            'week_registrations': week_registrations,
            'last_updated': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'error': 'Failed to fetch statistics'}), 500

@app.route('/api/verify/<ticket_id>', methods=['GET'])
def verify_ticket(ticket_id):
    """Verify ticket authenticity"""
    try:
        # Clean ticket ID
        clean_id = ticket_id.strip().replace('#', '').upper()
        
        participant = Participant.query.filter_by(ticket_id=clean_id).first()
        
        if participant:
            return jsonify({
                'valid': True,
                'participant': participant.to_dict(),
                'verified_at': datetime.utcnow().isoformat()
            })
        else:
            return jsonify({
                'valid': False,
                'message': 'Ticket not found'
            }), 404
            
    except Exception as e:
        print(f"Error verifying ticket: {e}")
        return jsonify({'error': 'Verification failed'}), 500

# File serving routes
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded avatar images"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@app.route('/qr_codes/<filename>')
def qr_code_file(filename):
    """Serve QR code images"""
    try:
        return send_from_directory(app.config['QR_FOLDER'], filename)
    except FileNotFoundError:
        return jsonify({'error': 'QR code not found'}), 404

# Health check route
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(413)
def too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 500KB'}), 413

# Initialize database
def init_db():
    """Initialize database tables"""
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database initialized successfully")
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")

# Development route (remove in production)
@app.route('/api/reset-db', methods=['POST'])
def reset_database():
    """Reset database - DEVELOPMENT ONLY"""
    if app.debug:
        try:
            db.drop_all()
            db.create_all()
            return jsonify({'message': 'Database reset successfully'})
        except Exception as e:
            return jsonify({'error': f'Failed to reset database: {e}'}), 500
    else:
        return jsonify({'error': 'Not available in production'}), 403

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Print startup information
    print("🎫 Conference Ticket Generator Backend")
    print("=" * 50)
    print(f"📁 Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"🔳 QR codes folder: {app.config['QR_FOLDER']}")
    print(f"🗄️  Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print("=" * 50)
    print("🚀 Starting server...")
    print("📱 Frontend should run on: http://localhost:5173")
    print("🔗 Backend API: http://localhost:5000")
    print("=" * 50)
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=True
    )