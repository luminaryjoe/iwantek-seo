#!/usr/bin/env python3
"""
Reddit Auto-Poster for iwantek
Posts content to Reddit with safety checks
"""

import os
import sys
import time
import praw
from datetime import datetime

def load_config():
    """Load Reddit API configuration from environment"""
    return {
        'client_id': os.getenv('REDDIT_CLIENT_ID'),
        'client_secret': os.getenv('REDDIT_CLIENT_SECRET'),
        'username': os.getenv('REDDIT_USERNAME'),
        'password': os.getenv('REDDIT_PASSWORD'),
        'user_agent': os.getenv('REDDIT_USER_AGENT', 'iwantek-automation/1.0')
    }

def connect_reddit(config):
    """Connect to Reddit API"""
    return praw.Reddit(
        client_id=config['client_id'],
        client_secret=config['client_secret'],
        username=config['username'],
        password=config['password'],
        user_agent=config['user_agent']
    )

def log_post(submission, subreddit):
    """Log post to file"""
    log_dir = '/root/.openclaw/workspace/iwantek-reddit/logs'
    os.makedirs(log_dir, exist_ok=True)
    
    log_file = os.path.join(log_dir, 'posts.log')
    with open(log_file, 'a') as f:
        f.write(f"{datetime.now().isoformat()} | {submission.id} | r/{subreddit} | {submission.title} | {submission.url}\n")

def submit_post(reddit, subreddit_name, title, body):
    """Submit a post to Reddit"""
    try:
        subreddit = reddit.subreddit(subreddit_name)
        submission = subreddit.submit(title=title, selftext=body)
        
        print(f"✅ Post submitted successfully!")
        print(f"   URL: {submission.url}")
        print(f"   Title: {submission.title}")
        print(f"   Time: {datetime.now()}")
        
        log_post(submission, subreddit_name)
        return submission
        
    except Exception as e:
        print(f"❌ Error posting: {e}")
        return None

def main():
    print("=" * 60)
    print("Reddit Auto-Poster for iwantek")
    print("=" * 60)
    print()
    
    # Check if running in auto mode
    auto_mode = '--auto' in sys.argv
    
    # Load configuration
    config = load_config()
    if not all([config['client_id'], config['client_secret'], 
                config['username'], config['password']]):
        print("❌ Error: Reddit API credentials not configured")
        print("\nPlease set environment variables:")
        print("  REDDIT_CLIENT_ID")
        print("  REDDIT_CLIENT_SECRET") 
        print("  REDDIT_USERNAME")
        print("  REDDIT_PASSWORD")
        print("\nOr create .env file and run:")
        print("  source /root/.openclaw/workspace/iwantek-reddit/.env")
        sys.exit(1)
    
    # Connect to Reddit
    print("🔌 Connecting to Reddit...")
    try:
        reddit = connect_reddit(config)
        user = reddit.user.me()
        print(f"✅ Connected as: {user}")
        print(f"   Karma: {user.link_karma + user.comment_karma}")
        print()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)
    
    # Get post details
    if len(sys.argv) >= 4 and not auto_mode:
        subreddit = sys.argv[1]
        title = sys.argv[2]
        body_file = sys.argv[3]
        
        if not os.path.exists(body_file):
            print(f"❌ Error: Body file not found: {body_file}")
            sys.exit(1)
        
        with open(body_file, 'r') as f:
            body = f.read()
    else:
        # Interactive mode
        print("📋 Enter post details:")
        subreddit = input("Subreddit (without r/): ").strip()
        title = input("Title: ").strip()
        
        print("Enter body (Ctrl+D when done):")
        body_lines = []
        try:
            while True:
                line = input()
                body_lines.append(line)
        except EOFError:
            pass
        body = '\n'.join(body_lines)
    
    # Preview
    print("\n" + "=" * 60)
    print("📋 Post Preview:")
    print("=" * 60)
    print(f"Subreddit: r/{subreddit}")
    print(f"Title: {title}")
    print(f"Body length: {len(body)} characters")
    print(f"Body preview:\n{body[:200]}...")
    print("=" * 60)
    print()
    
    # Confirm
    if not auto_mode:
        print("⚠️  Ready to post? (yes/no): ", end='')
        confirmation = input().lower()
        if confirmation not in ['yes', 'y']:
            print("❌ Post cancelled")
            sys.exit(0)
    
    # Submit
    print("\n🚀 Submitting post...")
    submission = submit_post(reddit, subreddit, title, body)
    
    if submission:
        print("\n✅ Post published successfully!")
        print(f"   View at: {submission.url}")
    else:
        print("\n❌ Failed to publish post")
        sys.exit(1)

if __name__ == '__main__':
    main()
