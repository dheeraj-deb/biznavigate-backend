import { InboxGateway } from './inbox.gateway';

describe('InboxGateway tenant safety', () => {
  const businessId = '00000000-0000-0000-0000-000000000001';
  const otherBusinessId = '00000000-0000-0000-0000-000000000002';

  function buildGateway() {
    return new InboxGateway({} as any, {} as any);
  }

  function buildClient(authBusinessId = businessId) {
    return {
      id: 'socket-1',
      data: { business_id: authBusinessId },
      join: jest.fn(),
      leave: jest.fn(),
      disconnect: jest.fn(),
      handshake: {
        auth: {},
        headers: {},
        query: {},
      },
    };
  }

  it('allows a socket to join its own business room', () => {
    const gateway = buildGateway();
    const client = buildClient();

    const result = gateway.handleJoin(client as any, businessId);

    expect(client.join).toHaveBeenCalledWith(`biz:${businessId}`);
    expect(result).toEqual({ joined: businessId });
  });

  it('rejects a socket joining another business room', () => {
    const gateway = buildGateway();
    const client = buildClient();

    const result = gateway.handleJoin(client as any, otherBusinessId);

    expect(client.join).not.toHaveBeenCalled();
    expect(result).toEqual({ joined: false, error: 'Forbidden business room' });
  });

  it('does not leave another business room', () => {
    const gateway = buildGateway();
    const client = buildClient();

    gateway.handleLeave(client as any, otherBusinessId);

    expect(client.leave).not.toHaveBeenCalled();
  });
});
