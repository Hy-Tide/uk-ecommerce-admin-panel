import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export const PlaceholderPage = ({ name }) => {
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
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}
        >
          <Sparkles size={32} />
        </div>
        
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {name} Placeholder
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            This route is successfully configured in the centralized routing matrix. The dedicated view for <strong>{name}</strong> is currently staged for deployment.
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

export default PlaceholderPage;
