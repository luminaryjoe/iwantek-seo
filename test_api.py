#!/usr/bin/env python3
"""
Reddit API Test Script for iwantek
Tests connection and basic functionality
"""

import os
import sys

def test_import():
    """Test if praw is installed"""
    try:
        import praw
        print("✅ praw module imported successfully")
        return True
    except ImportError:
        print("❌ praw not installed. Run: pip3 install praw")
        return False

def test_env_vars():
    """Test if environment variables are set"""
    required_vars = [
        'REDDIT_CLIENT_ID',
        'REDDIT_CLIENT_SECRET',
        'REDDIT_USERNAME',
        'REDDIT_PASSWORD'
    ]
    
    missing = []
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        print("❌ Missing environment variables:")
        for var in missing:
            print(f"   - {var}")
        print("\nPlease set these variables in your .env file")
        return False
    
    print("✅ All required environment variables are set")
    return True

def test_connection():
    """Test Reddit API connection"""
    try:
        import praw
        
        reddit = praw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            username=os.getenv('REDDIT_USERNAME'),
            password=os.getenv('REDDIT_PASSWORD'),
            user_agent=os.getenv('REDDIT_USER_AGENT', 'iwantek-automation/1.0')
        )
        
        user = reddit.user.me()
        print(f"✅ Successfully connected to Reddit!")
        print(f"   Logged in as: {user}")
        print(f"   Link Karma: {user.link_karma}")
        print(f"   Comment Karma: {user.comment_karma}")
        print(f"   Total Karma: {user.link_karma + user.comment_karma}")
        
        # Test subreddit access
        subreddit = reddit.subreddit('CallCenterLife')
        print(f"\n✅ Subreddit access working:")
        print(f"   r/CallCenterLife: {subreddit.subscribers} subscribers")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def main():
    print("=" * 50)
    print("Reddit API Test for iwantek")
    print("=" * 50)
    print()
    
    # Test 1: Import
    print("Test 1: Checking praw installation...")
    if not test_import():
        print("\nInstall praw: pip3 install praw")
        sys.exit(1)
    print()
    
    # Test 2: Environment variables
    print("Test 2: Checking environment variables...")
    if not test_env_vars():
        print("\nCreate .env file with your Reddit API credentials")
        sys.exit(1)
    print()
    
    # Test 3: Connection
    print("Test 3: Testing Reddit API connection...")
    if not test_connection():
        print("\nCheck your credentials and try again")
        sys.exit(1)
    print()
    
    print("=" * 50)
    print("✅ All tests passed!")
    print("=" * 50)
    print()
    print("Next steps:")
    print("1. Review your account details above")
    print("2. Run post_to_reddit.py to publish content")
    print("3. Check logs/ directory for posting history")

if __name__ == '__main__':
    main()
