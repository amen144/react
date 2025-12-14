'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
}

interface FriendRequest {
  id: number;
  fromUser: User;
  createdAt: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const userID = localStorage.getItem('userID');
    
    if (!token || !userID) {
      router.push('/');
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);
    fetchFriends();
    // fetchIncomingRequests(); // implement on backend if needed
  }, [router]);

  const fetchFriends = async () => {
    try {
      const res = await axios.get("/api/friends", { headers: getAuthHeaders() });
      setFriends(res.data || []);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.get(`/api/search?q=${searchQuery}`, { headers: getAuthHeaders() });
      setSearchResults(res.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setMessage('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: number) => {
    try {
      await axios.post(
        "/api/friends/request",
        { recipientId: userId },
        { headers: getAuthHeaders() }
      );
      setSearchResults(searchResults.filter((u) => u.id !== userId));
      setMessage('Friend request sent!');
      setTimeout(() => setMessage(null), 2000);
    } catch (error: any) {
      console.error('Failed to send request:', error);
      setMessage(error?.response?.data?.error || 'Failed to send request');
    }
  };

  const acceptRequest = async (friendId: number) => {
    try {
      await axios.post(
        "/api/friends/accept",
        { friendId },
        { headers: getAuthHeaders() }
      );
      setIncomingRequests(incomingRequests.filter((r) => r.id !== friendId));
      fetchFriends();
      setMessage('Friend added!');
      setTimeout(() => setMessage(null), 2000);
    } catch (error: any) {
      console.error('Failed to accept request:', error);
      setMessage(error?.response?.data?.error || 'Failed to accept');
    }
  };

  const declineRequest = async (requestId: number) => {
    try {
      await axios.delete(
        `/api/friends/request/${requestId}`,
        { headers: getAuthHeaders() }
      );
      setIncomingRequests(incomingRequests.filter((r) => r.id !== requestId));
      setMessage('Request declined');
      setTimeout(() => setMessage(null), 2000);
    } catch (error: any) {
      console.error('Failed to decline request:', error);
      setMessage(error?.response?.data?.error || 'Failed to decline');
    }
  };

  const removeFriend = async (friendId: number) => {
    if (!window.confirm('Remove this friend?')) return;
    try {
      await axios.delete(`/api/friends/${friendId}`, { headers: getAuthHeaders() });
      setFriends(friends.filter((f) => f.id !== friendId));
      setMessage('Friend removed');
      setTimeout(() => setMessage(null), 2000);
    } catch (error: any) {
      console.error('Failed to remove friend:', error);
      setMessage(error?.response?.data?.error || 'Failed to remove');
    }
  };

  return (
    <div className="min-h-screen p-6 backdrop-blur-xs border-1-gray-400">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">Friends</h1>
          <button
            onClick={() => router.push('/home')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
            {message}
          </div>
        )}

        {/* Search Section */}
        <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-xl shadow p-6 border border-white/30">
          <h2 className="text-2xl font-bold mb-4">Search Users</h2>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg bg-white/30"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          <div className="space-y-2">
            {searchResults.length === 0 && searchQuery && !loading && (
              <p className="text-gray-400">No users found</p>
            )}
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-300">{user.email}</p>
                </div>
                <button
                  onClick={() => sendFriendRequest(user.id)}
                  className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Friends List Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow p-6 border border-white/30">
          <h2 className="text-2xl font-bold mb-4">My Friends ({friends.length})</h2>
          <div className="space-y-2">
            {friends.length === 0 ? (
              <p className="text-gray-400">No friends yet</p>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="font-semibold">{friend.name}</p>
                    <p className="text-sm text-gray-300">{friend.email}</p>
                  </div>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}