import React, { useEffect, useState } from 'react';
import { DataTable} from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { MdKeyboardArrowDown } from "react-icons/md";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number | string;
  date_end: number | string;
}

const Table = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [rowCount, setRowCount] = useState<number>(1); // Number of rows to select
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });
  const rows = 12;

  const fetchArtworks = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber + 1}&limit=${rows}`
      );
      const data = await response.json();
  
      const transformedData = data.data.map((item: any) => ({
        id: item.id,
        title: item.title || 'Untitled',
        place_of_origin: item.place_of_origin || 'Unknown',
        artist_display: item.artist_display || 'Unknown Artist',
        inscriptions: item.inscriptions || 'No Inscriptions',
        date_start: item.date_start || 'N/A',
        date_end: item.date_end || 'N/A',
      }));
  
      setArtworks(transformedData);
      setTotalRecords(data.pagination.total);
      setPage(pageNumber);
      
      return transformedData; 
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(page);
  }, [page]);

  // interface for pagination

  interface PaginationEvent {
    first: number;
    rows: number;
    page: number;
    pageCount: number;
  }
  
  const onPageChange = (event: PaginationEvent) => {
    setPage(event.page);
  };

  const onHeaderArrowClick = (e: React.MouseEvent) => {
    const { ex, ey } = e; 
    setDialogPosition({ top: ex + 5, left: ey - 50 });
    setShowDialog(true);
  };

  const confirmRowSelection = async () => {
    const selected = artworks.slice(0, Math.min(rowCount, artworks.length));
    setSelectedArtworks(selected);
  
    const remainingRows = rowCount - selected.length;
  
    if (remainingRows > 0) {
      const nextPageNumber = page + 1; 
      const nextPageArtworks = await fetchArtworks(nextPageNumber);
  
      const additionalSelected = nextPageArtworks.slice(0, remainingRows);
      setSelectedArtworks((prev) => [...prev, ...additionalSelected]);
    }
  
    setShowDialog(false);
  };

  const headerArrow = (
    <MdKeyboardArrowDown onClick={onHeaderArrowClick} />
  );

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Artworks</h2>
      <DataTable
        value={artworks}
        tableStyle={{ minWidth: '60rem' }}
        paginator
        rows={rows}
        totalRecords={totalRecords}
        lazy
        first={page * rows}
        onPage={onPageChange}
        loading={loading}
        selectionMode="checkbox"
        selection={selectedArtworks}
        onSelectionChange={(e) => setSelectedArtworks(e.value)}
        dataKey="id"
      >
        <Column
          header={headerArrow} 
          selectionMode="multiple"
          headerStyle={{ width: '3rem', textAlign: 'center' }}
        ></Column>
        <Column field="title" header="Title"></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Start Year"></Column>
        <Column field="date_end" header="End Year"></Column>
      </DataTable>

      <Dialog
        header="Select Rows"
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        style={{
            position: 'absolute',
            top: dialogPosition.top,
            left: dialogPosition.left,
            width: 'auto',
          }}
      >
        <div className="p-field">
          <InputNumber
            value={rowCount}
            placeholder='Select rows'
            onValueChange={(e) => setRowCount(e.value || 1)}
            min={1}
            max={100}
          />
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            label="Submit"
            icon="pi pi-check"
            onClick={confirmRowSelection}
            autoFocus
          />
        </div>
      </Dialog>
    </div>
  );
};

export default Table;
