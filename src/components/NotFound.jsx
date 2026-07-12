import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}
        >
          <FileQuestion size={32} />
        </div>
        
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            404 - Page Not Found
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            We couldn't locate the requested page. It might have been relocated, deleted, or the route name may be incorrect.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/dashboard')}
          style={{ marginTop: '8px' }}
        >
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
};

export default NotFound;
