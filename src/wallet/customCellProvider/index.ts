import {
  Indexer as IndexerType,
  CellProvider,
  CellCollector,
  QueryOptions
} from "@ckb-lumos/base";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { INDEXER } from "../../config";

class CustomCellProvider implements CellProvider {
  public readonly uri: string;

  constructor(
    private readonly indexer: IndexerType,
    private readonly myQueryOptions: QueryOptions
  ) {
    this.uri = indexer.uri;
  }

  collector(queryOptions: QueryOptions): CellCollector {
    return this.indexer.collector({ ...queryOptions, ...this.myQueryOptions });
  }
}

function getCellProvider(queryOptions: QueryOptions = {}): CellProvider {
  return new CustomCellProvider(INDEXER, queryOptions);
}

function getEmptyCellProvider(queryOptions: QueryOptions = {}): CellProvider {
  return getCellProvider({ ...queryOptions, type: "empty" });
}

function getTransactionSkeleton() {
  return TransactionSkeleton({
    cellProvider: getEmptyCellProvider()
  });
}

export { getEmptyCellProvider, getTransactionSkeleton };
