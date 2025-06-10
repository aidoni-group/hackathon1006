#!/usr/bin/env python3
"""
Interactive CLI for Therapy Great Again MCP Server
Beautiful terminal interface with continuous interaction
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, List, Optional
import questionary
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt
from rich.layout import Layout
from rich.live import Live
from rich import print as rprint
from rich.markdown import Markdown

class TherapyCLI:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.console = Console()
        self.current_session = None
        self.sessions_cache = {}
        self.personalities_cache = {}
        self.load_personalities()
    
    def load_personalities(self):
        """Load available personalities from server"""
        try:
            response = requests.get(f"{self.base_url}/personalities")
            if response.status_code == 200:
                data = response.json()
                for p in data['personalities']:
                    self.personalities_cache[p['key']] = p
            else:
                self.console.print("❌ Could not load personalities from server", style="red")
        except Exception as e:
            self.console.print(f"❌ Error connecting to server: {e}", style="red")
            sys.exit(1)
    
    def show_header(self):
        """Show the main header"""
        self.console.clear()
        header = Panel(
            Text("🧠 THERAPY GREAT AGAIN - Interactive CLI", justify="center", style="bold magenta"),
            subtitle=f"Connected to: {self.base_url}",
            border_style="magenta"
        )
        self.console.print(header)
        self.console.print()
    
    def show_personalities_table(self):
        """Display available personalities in a table"""
        table = Table(title="🎭 Available AI Therapists", show_header=True, header_style="bold blue")
        table.add_column("Key", style="cyan", no_wrap=True)
        table.add_column("Name", style="magenta")
        table.add_column("Greeting Preview", style="white")
        
        for key, personality in self.personalities_cache.items():
            greeting_preview = personality['greeting'][:60] + "..." if len(personality['greeting']) > 60 else personality['greeting']
            table.add_row(key, personality['name'], greeting_preview)
        
        self.console.print(table)
        self.console.print()
    
    def show_sessions_table(self):
        """Display active sessions in a table"""
        try:
            response = requests.get(f"{self.base_url}/sessions")
            if response.status_code == 200:
                data = response.json()
                sessions = data['sessions']
                
                if not sessions:
                    self.console.print("📝 No active sessions", style="yellow")
                    return
                
                table = Table(title="📋 Active Therapy Sessions", show_header=True, header_style="bold green")
                table.add_column("Session ID", style="cyan", no_wrap=True)
                table.add_column("Therapist", style="magenta")
                table.add_column("Messages", style="white")
                table.add_column("Created At", style="dim")
                
                for session in sessions:
                    session_id_short = session['session_id'][:8] + "..."
                    created_at = datetime.fromisoformat(session['created_at']).strftime("%H:%M %d/%m")
                    table.add_row(
                        session_id_short,
                        session['personality_name'],
                        str(session['message_count']),
                        created_at
                    )
                
                self.console.print(table)
                self.console.print()
                
                # Update cache
                self.sessions_cache = {s['session_id']: s for s in sessions}
            else:
                self.console.print("❌ Could not load sessions", style="red")
        except Exception as e:
            self.console.print(f"❌ Error loading sessions: {e}", style="red")
    
    def create_session(self):
        """Create a new therapy session"""
        self.show_personalities_table()
        
        personality_choices = [
            questionary.Choice(f"{p['name']} ({key})", key) 
            for key, p in self.personalities_cache.items()
        ]
        
        personality = questionary.select(
            "🎭 Choose your AI therapist:",
            choices=personality_choices
        ).ask()
        
        if not personality:
            return
        
        try:
            response = requests.post(
                f"{self.base_url}/sessions/new",
                json={"personality": personality}
            )
            
            if response.status_code == 200:
                session_data = response.json()
                session_id = session_data['session_id']
                
                # Show greeting
                greeting_panel = Panel(
                    session_data['greeting'],
                    title=f"💬 {session_data['personality_name']} says:",
                    border_style="green"
                )
                self.console.print(greeting_panel)
                self.console.print()
                
                # Ask if user wants to start chatting immediately
                start_chat = questionary.confirm("Start chatting with this therapist now?").ask()
                if start_chat:
                    self.current_session = session_id
                    self.chat_session()
                
            else:
                self.console.print("❌ Failed to create session", style="red")
                
        except Exception as e:
            self.console.print(f"❌ Error creating session: {e}", style="red")
    
    def select_session(self):
        """Select an existing session to chat with"""
        self.show_sessions_table()
        
        if not self.sessions_cache:
            self.console.print("📝 No active sessions. Create one first!", style="yellow")
            return
        
        session_choices = [
            questionary.Choice(
                f"{s['personality_name']} ({s['session_id'][:8]}...) - {s['message_count']} msgs",
                s['session_id']
            ) for s in self.sessions_cache.values()
        ]
        
        session_id = questionary.select(
            "📋 Select a session to continue:",
            choices=session_choices
        ).ask()
        
        if session_id:
            self.current_session = session_id
            self.chat_session()
    
    def chat_session(self):
        """Interactive chat with the selected session"""
        if not self.current_session:
            self.console.print("❌ No session selected", style="red")
            return
        
        # Get session info
        session_info = self.sessions_cache.get(self.current_session)
        if not session_info:
            # Refresh session info
            try:
                response = requests.get(f"{self.base_url}/sessions")
                if response.status_code == 200:
                    sessions = response.json()['sessions']
                    for s in sessions:
                        if s['session_id'] == self.current_session:
                            session_info = s
                            break
            except:
                pass
        
        therapist_name = session_info['personality_name'] if session_info else "AI Therapist"
        
        self.console.print(Panel(
            f"💬 Now chatting with {therapist_name}\nType 'quit' to return to main menu, 'history' to view conversation history",
            title="Chat Session Active",
            border_style="blue"
        ))
        
        while True:
            try:
                # Get user input
                user_message = questionary.text(
                    "You:",
                    multiline=False,
                    qmark="💭"
                ).ask()
                
                if not user_message:
                    continue
                
                if user_message.lower() == 'quit':
                    break
                elif user_message.lower() == 'history':
                    self.show_conversation_history(self.current_session)
                    continue
                
                # Send message to server
                with self.console.status("[bold green]AI is thinking..."):
                    response = requests.post(
                        f"{self.base_url}/call",
                        json={
                            "inputs": {
                                "session_id": self.current_session,
                                "message": user_message
                            }
                        }
                    )
                
                if response.status_code == 200:
                    ai_response = response.json()['output']
                    
                    # Display AI response in a panel
                    ai_panel = Panel(
                        ai_response,
                        title=f"🤖 {therapist_name}:",
                        border_style="green"
                    )
                    self.console.print(ai_panel)
                    self.console.print()
                else:
                    self.console.print("❌ Error getting response from AI", style="red")
                    
            except KeyboardInterrupt:
                self.console.print("\n👋 Returning to main menu...", style="yellow")
                break
            except Exception as e:
                self.console.print(f"❌ Error: {e}", style="red")
    
    def show_conversation_history(self, session_id: str):
        """Show conversation history for a session"""
        try:
            response = requests.get(f"{self.base_url}/sessions/{session_id}/history")
            if response.status_code == 200:
                history_data = response.json()
                
                self.console.print(Panel(
                    f"Conversation with {history_data['personality']}",
                    title="📜 Conversation History",
                    border_style="cyan"
                ))
                
                for i, msg in enumerate(history_data['conversation_history'], 1):
                    # User message
                    self.console.print(f"[bold cyan]{i}. You:[/bold cyan] {msg['user']}")
                    # AI response
                    self.console.print(f"[bold green]   AI:[/bold green] {msg['assistant']}")
                    self.console.print()
                
                questionary.press_any_key_to_continue("Press any key to continue...").ask()
            else:
                self.console.print("❌ Could not load history", style="red")
        except Exception as e:
            self.console.print(f"❌ Error loading history: {e}", style="red")
    
    def delete_session(self):
        """Delete a therapy session"""
        self.show_sessions_table()
        
        if not self.sessions_cache:
            self.console.print("📝 No active sessions to delete", style="yellow")
            return
        
        session_choices = [
            questionary.Choice(
                f"{s['personality_name']} ({s['session_id'][:8]}...) - {s['message_count']} msgs",
                s['session_id']
            ) for s in self.sessions_cache.values()
        ]
        
        session_id = questionary.select(
            "🗑️ Select a session to delete:",
            choices=session_choices
        ).ask()
        
        if not session_id:
            return
        
        confirm = questionary.confirm(
            f"Are you sure you want to delete this session? This cannot be undone."
        ).ask()
        
        if confirm:
            try:
                response = requests.delete(f"{self.base_url}/sessions/{session_id}")
                if response.status_code == 200:
                    self.console.print("✅ Session deleted successfully", style="green")
                    # Clear from cache
                    if session_id in self.sessions_cache:
                        del self.sessions_cache[session_id]
                    # Clear current session if it was deleted
                    if self.current_session == session_id:
                        self.current_session = None
                else:
                    self.console.print("❌ Failed to delete session", style="red")
            except Exception as e:
                self.console.print(f"❌ Error deleting session: {e}", style="red")
    
    def show_server_status(self):
        """Show server health and status"""
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                health_data = response.json()
                
                status_text = f"""
**Server Status**: {'🟢 Healthy' if health_data['status'] == 'healthy' else '🔴 Unhealthy'}
**Version**: {health_data['version']}
**OpenAI Configured**: {'✅ Yes' if health_data['openai_configured'] else '❌ No'}
**Active Sessions**: {health_data['active_sessions']}
**Available Personalities**: {health_data['available_personalities']}
**Last Updated**: {datetime.fromisoformat(health_data['timestamp']).strftime('%H:%M:%S %d/%m/%Y')}
                """
                
                status_panel = Panel(
                    Markdown(status_text.strip()),
                    title="🏥 Server Health Status",
                    border_style="blue"
                )
                self.console.print(status_panel)
                questionary.press_any_key_to_continue("Press any key to continue...").ask()
            else:
                self.console.print("❌ Could not get server status", style="red")
        except Exception as e:
            self.console.print(f"❌ Error getting server status: {e}", style="red")
    
    def main_menu(self):
        """Main interactive menu"""
        while True:
            self.show_header()
            
            choices = [
                "🎭 View Available AI Therapists",
                "➕ Create New Therapy Session",
                "💬 Continue Existing Session",
                "📋 View All Sessions",
                "📜 View Session History",
                "🗑️ Delete Session",
                "🏥 Server Status",
                "❌ Exit"
            ]
            
            choice = questionary.select(
                "What would you like to do?",
                choices=choices,
                pointer="👉"
            ).ask()
            
            if not choice:
                break
            
            if choice.startswith("🎭"):
                self.show_personalities_table()
                questionary.press_any_key_to_continue("Press any key to continue...").ask()
            elif choice.startswith("➕"):
                self.create_session()
            elif choice.startswith("💬"):
                self.select_session()
            elif choice.startswith("📋"):
                self.show_sessions_table()
                questionary.press_any_key_to_continue("Press any key to continue...").ask()
            elif choice.startswith("📜"):
                # Select session for history
                self.show_sessions_table()
                if self.sessions_cache:
                    session_choices = [
                        questionary.Choice(
                            f"{s['personality_name']} ({s['session_id'][:8]}...)",
                            s['session_id']
                        ) for s in self.sessions_cache.values()
                    ]
                    session_id = questionary.select(
                        "📜 Select session to view history:",
                        choices=session_choices
                    ).ask()
                    if session_id:
                        self.show_conversation_history(session_id)
            elif choice.startswith("🗑️"):
                self.delete_session()
            elif choice.startswith("🏥"):
                self.show_server_status()
            elif choice.startswith("❌"):
                break
        
        self.console.print("👋 Thanks for using Therapy Great Again CLI!", style="bold magenta")

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Therapy Great Again - Interactive CLI")
    parser.add_argument("--url", default="http://localhost:3000", help="MCP server URL")
    args = parser.parse_args()
    
    cli = TherapyCLI(args.url)
    
    try:
        cli.main_menu()
    except KeyboardInterrupt:
        cli.console.print("\n👋 Goodbye!", style="bold magenta")
    except Exception as e:
        cli.console.print(f"\n❌ Unexpected error: {e}", style="red")

if __name__ == "__main__":
    main() 