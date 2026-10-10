import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category } from "../../day02/types";
import {
  createProperty,
  deleteProperty,
  fetchProperties,
  fetchProperty,
} from "../api";

export const propertyKeys = {
  all: ["properties"] as const,
  list: (category: Category | "all") =>
    [...propertyKeys.all, "list", category] as const,
  detail: (id: number | null) => [...propertyKeys.all, "detail", id] as const,
};

export function useProperties(category: Category | "all") {
  return useQuery({
    queryKey: propertyKeys.list(category),
    queryFn: () => fetchProperties(category),
    staleTime: 30_000,
  });
}

export function useProperty(id: number | null) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => fetchProperty(id as number),
    enabled: id !== null,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
}
