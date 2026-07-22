import { baseOrganizations } from "@/components/OrganizationsTable";
import type { OrgTreeNode } from "./OrgTreeSelect";

function findOrgRecursive(nodes: any[], orgId: string): any {
  for (const node of nodes) {
    if (node.id === orgId) return node;
    if (node.children) {
      const found = findOrgRecursive(node.children, orgId);
      if (found) return found;
    }
  }
  return null;
}

function toTreeNode(org: any): OrgTreeNode {
  return {
    id: org.id,
    name: org.name,
    referenceId: org.referenceId,
    children: (org.children ?? []).map(toTreeNode),
  };
}

/** Returns the descendant org tree (children, grandchildren, …) for the given org id. */
export function getDescendantOrgTree(orgId: string): OrgTreeNode[] {
  const org = findOrgRecursive(baseOrganizations, orgId);
  if (!org?.children) return [];
  return org.children.map(toTreeNode);
}

/** Flat list of all descendant org ids (children, grandchildren, …) for the given org id. */
export function getAllDescendantOrgIds(orgId: string): string[] {
  const collect = (nodes: OrgTreeNode[]): string[] =>
    nodes.flatMap((n) => [n.id, ...collect(n.children ?? [])]);
  return collect(getDescendantOrgTree(orgId));
}

/** Look up an org's display name by id, searching the full tree. */
export function findOrgNameById(orgId: string): string {
  const org = findOrgRecursive(baseOrganizations, orgId);
  return org?.name ?? orgId;
}
