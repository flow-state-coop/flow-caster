import { gql } from "graphql-request";

export const FLOW_SPLITTER_POOL_QUERY = gql`
  query FlowSplitterPoolQuery($poolId: String!) {
    pools(where: { id: $poolId }) {
      poolAddress
      name
      symbol
      token
      poolAdmins {
        address
      }
    }
  }
`;

// TODO: no need for non zero on non cracked dev instance
// poolMembers(first: 1000, where: { units_not: "0" }) {

export const SUPERFLUID_QUERY = gql`
  query SuperfluidQuery($token: String!, $gdaPool: String!) {
    token(id: $token) {
      id
      symbol
    }
    pool(id: $gdaPool) {
      id
      flowRate
      totalUnits
      totalAmountDistributedUntilUpdatedAt
      totalAmountFlowedDistributedUntilUpdatedAt
      totalAmountInstantlyDistributedUntilUpdatedAt
      totalFlowAdjustmentAmountDistributedUntilUpdatedAt
      updatedAtTimestamp
      poolMembers(first: 1000) {
        account {
          id
        }
        units
        isConnected
        poolTotalAmountDistributedUntilUpdatedAt
        updatedAtTimestamp
      }
      poolDistributors(
        first: 1000
        where: { flowRate_not: "0" }
        orderBy: flowRate
        orderDirection: desc
      ) {
        account {
          id
        }
        flowRate
        totalAmountDistributedUntilUpdatedAt
        updatedAtTimestamp
      }
      token {
        id
        symbol
      }
      poolCreatedEvent {
        timestamp
        transactionHash
        name
      }
      memberUnitsUpdatedEvents(
        first: 1000
        orderBy: timestamp
        orderDirection: desc
      ) {
        units
        oldUnits
        poolMember {
          account {
            id
          }
        }
        timestamp
        transactionHash
      }
    }
  }
`;

export const SF_SUP_TOKEN_SNAPSHOT = gql`
  query SuperfluidSupTokenQuery($address: String!) {
    accountTokenSnapshots(
      where: {
        token: "0xa69f80524381275a7ffdb3ae01c54150644c8792"
        account: $address
      }
    ) {
      balanceUntilUpdatedAt
      totalNetFlowRate
      updatedAtTimestamp
      totalInflowRate
      totalOutflowRate
      account {
        id
      }
    }
  }
`;
