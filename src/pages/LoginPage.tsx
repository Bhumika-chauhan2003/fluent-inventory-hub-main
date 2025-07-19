import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [device, setDevice] = useState('');

  // Fetch device IP on load
  React.useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setDevice(data.ip);
      } catch (error) {
        console.error('Error fetching device IP:', error);
      }
    };

    fetchIp();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password, device);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-md p-6 bg-white shadow-md rounded-2xl">
        <CardContent>
          <h2 className="text-2xl font-semibold text-center mb-4">User Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
